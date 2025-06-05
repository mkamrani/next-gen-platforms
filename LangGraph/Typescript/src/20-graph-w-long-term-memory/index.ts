import "@langchain/langgraph/zod";
import {
  StateGraph,
  START,
  END,
  MessagesAnnotation,
  MemorySaver,
  BaseCheckpointSaver,
  InMemoryStore,
  BaseStore,
  LangGraphRunnableConfig,
  Item,
} from "@langchain/langgraph";
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { tool } from "@langchain/core/tools";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { z } from "zod";
import dotenv from "dotenv";
import { PromptTemplate } from "@langchain/core/prompts";
// Load .env file
dotenv.config();

const baseModel = new ChatOpenAI({
  model: "gpt-4o-mini",
});

const multiply = ({ a, b }: { a: number; b: number }): number => {
  return a * b;
};

const add = ({ a, b }: { a: number; b: number }): number => {
  return a + b;
};

const multiplyToolDescription = {
  name: "multiply",
  description: "Multiply two numbers",
  schema: z.object({
    a: z.number(),
    b: z.number(),
  }),
};

const addToolDescription = {
  name: "add",
  description: "Add two numbers",
  schema: z.object({
    a: z.number(),
    b: z.number(),
  }),
};

const multiplyTool = tool(multiply, multiplyToolDescription);
const addTool = tool(add, addToolDescription);

// LLM Node

async function llmNode(
  state: typeof MessagesAnnotation.State,
  config: LangGraphRunnableConfig
): Promise<typeof MessagesAnnotation.State> {
  console.log("Executing LLM Node");

  const template = `You are a helpful assistant that can perform mathematical calculations using the tools provided to you.
    You can also provide answers to the user's questions based on your built-in knowledge or the memory of the conversation.
    Your memory (could be empty) is: {memory}`;

  const store = config.store;
  const namespace = config.configurable?.memory?.namespace as string[];
  const promptTemplate = PromptTemplate.fromTemplate(template);
  const memory = (await store?.get(namespace, "summary")) as Item;
  const prompt = await promptTemplate.invoke({
    memory: memory?.value?.content || "",
  });

  const modelWithTools = baseModel.bindTools([multiplyTool, addTool]);

  const result = await modelWithTools.invoke([
    new SystemMessage(prompt.value),
    ...state.messages,
  ]);

  return {
    messages: [result],
  };
}

const prettyPrintMessage = (message: BaseMessage) => {
  if (message instanceof HumanMessage) {
    return `User: ${message.content}`;
  }
  if (message instanceof AIMessage) {
    if (
      "tool_calls" in message &&
      Array.isArray(message.tool_calls) &&
      message.tool_calls?.length
    ) {
      return `Agent calling tools: ${JSON.stringify(message.tool_calls)}`;
    } else {
      return `Agent: ${message.content}`;
    }
  }
  return "";
};

async function memoryNode(
  state: typeof MessagesAnnotation.State,
  config: LangGraphRunnableConfig
) {
  console.log("Executing Memory Node");
  const store = config.store;
  const namespace = config.configurable?.memory?.namespace as string[];

  const template = `
  You manage the memory of an agent that performs mathematical calculations and provides answers to the user.
  You have to make sure the events regarding calculations happening in the conversation are tracked in the memory.
  The events include:
  - A calculation is requested by the user
  - A calculation is performed by the agent
  Notes: 
  - You should not update the memory based on the intermediate results of the calculations.
  - Avoid updating the memory for events that are already tracked in the memory.
  You simply decide if the memory should be updated or not. If yes, simply provide a new summary of the events.
  Current memory (could be empty): {memory}
  Current conversation: {conversation}
  `;

  const promptTemplate = PromptTemplate.fromTemplate(template);
  const memory = (await store?.get(namespace, "summary")) as Item;
  const prompt = await promptTemplate.invoke({
    memory: memory?.value?.content || "",
    conversation: state.messages.map((m) => prettyPrintMessage(m)).join("\n"),
  });

  const updatableMemory = z.object({
    summary: z.string(),
    shouldUpdate: z.boolean(),
  });
  const modelWithStructuredOutput =
    baseModel.withStructuredOutput(updatableMemory);
  const result = await modelWithStructuredOutput.invoke(prompt.value);
  if (result.shouldUpdate) {
    await store?.put(namespace, "summary", {
      content: result.summary,
    });
  }

  return {
    messages: [new HumanMessage("Memory updated")],
  };
}

// Initialize the graph
const graphBuilder = new StateGraph(MessagesAnnotation)
  // Add our node
  .addNode("llm", llmNode)
  .addNode("tools", new ToolNode([multiplyTool, addTool])) // The name must be "tools"
  .addNode("memory", memoryNode)
  // Add edges to connect the nodes in sequence
  .addEdge(START, "llm")
  .addConditionalEdges("llm", toolsCondition)
  .addEdge("tools", "memory")
  .addEdge("memory", "llm")
  .addEdge("tools", END);

// within-thread memory (a.k.a. short-term memory)
const createCheckPointSaver = (): BaseCheckpointSaver => new MemorySaver();

// long-term memory
const createLongTermMemorySaver = (): BaseStore => new InMemoryStore();

// Compile the graph
export const graph = graphBuilder.compile({
  checkpointer: createCheckPointSaver(),
  store: createLongTermMemorySaver(),
});

// Execute the graph
const main = async () => {
  console.log("\n=== Starting Graph Execution ===\n");

  const result = await graph.invoke(
    {
      messages: [new HumanMessage("What is 2 * 3 + 4?")],
    },
    {
      configurable: {
        thread_id: "thread-1",
        memory: {
          namespace: ["user-123", "calculations"],
        },
      },
    }
  );

  console.log("Result:", result.messages[result.messages.length - 1].content);

  const newResult = await graph.invoke(
    {
      messages: [new HumanMessage("What calculations have you done so far?")],
    },
    {
      configurable: {
        thread_id: "thread-2-same-user",
        memory: {
          namespace: ["user-123", "calculations"], // change this to user-124 to see the difference
        },
      },
    }
  );

  console.log(
    "New Result:",
    newResult.messages[newResult.messages.length - 1].content
  );
};

main()
  .then(() => console.log("Graph execution completed successfully"))
  .catch(console.error);
