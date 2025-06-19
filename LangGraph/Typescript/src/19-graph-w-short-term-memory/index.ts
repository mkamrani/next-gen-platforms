import "@langchain/langgraph/zod";
import {
  StateGraph,
  START,
  END,
  MessagesAnnotation,
  MemorySaver,
  BaseCheckpointSaver,
} from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { tool } from "@langchain/core/tools";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { z } from "zod";
import dotenv from "dotenv";
import { RunnableConfig } from "@langchain/core/runnables";
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
  state: typeof MessagesAnnotation.State
): Promise<typeof MessagesAnnotation.State> {
  console.log("Executing LLM Node");

  const modelWithTools = baseModel.bindTools([multiplyTool, addTool]);

  const result = await modelWithTools.invoke(state.messages);

  return {
    messages: [result],
  };
}

// Initialize the graph
const graphBuilder = new StateGraph(MessagesAnnotation)
  // Add our node
  .addNode("llm", llmNode)
  .addNode("tools", new ToolNode([multiplyTool, addTool])) // The name must be "tools"
  // Add edges to connect the nodes in sequence
  .addEdge(START, "llm")
  .addConditionalEdges("llm", toolsCondition)
  .addEdge("tools", "llm")
  .addEdge("tools", END);

// within-thread memory (a.k.a. short-term memory)
const createCheckPointSaver = (): BaseCheckpointSaver => new MemorySaver();

// Compile the graph
export const graph = graphBuilder.compile({
  checkpointer: createCheckPointSaver(),
});

const runtimeConfig: RunnableConfig = {
  configurable: {
    thread_id: "my-unique-thread-id",
  },
};

// Execute the graph
const main = async () => {
  console.log("\n=== Starting Graph Execution ===\n");

  const result = await graph.invoke(
    {
      messages: [new HumanMessage("What is 2 * 3 + 4?")],
    },
    runtimeConfig
  );

  console.log("Result:", result.messages[result.messages.length - 1].content);

  const newResult = await graph.invoke(
    {
      messages: [new HumanMessage("What if you add 10 to the result?")],
    },
    runtimeConfig
  );

  console.log(
    "New Result:",
    newResult.messages[newResult.messages.length - 1].content
  );

  const state = await graph.getState(runtimeConfig); // getState along with updateState allow for something also known as "time travel"
  console.log("State:", state);
};

main()
  .then(() => console.log("Graph execution completed successfully"))
  .catch(console.error);
