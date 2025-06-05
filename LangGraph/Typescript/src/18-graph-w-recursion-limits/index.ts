import "@langchain/langgraph/zod";
import {
  StateGraph,
  START,
  END,
  MessagesAnnotation,
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

const calc = ({
  operator,
  a,
  b,
}: {
  operator: string;
  a: number;
  b: number;
}): number => {
  if (operator === "add") {
    return a + b;
  } else if (operator === "multiply") {
    return a * b;
  } else if (operator === "subtract") {
    return a - b;
  } else if (operator === "divide") {
    return a / b;
  } else {
    throw new Error("Invalid operator");
  }
};

const calcToolDescription = {
  name: "calc",
  description: "Calculate the result of a mathematical operation",
  schema: z.object({
    operator: z.enum(["add", "multiply", "subtract", "divide"]),
    a: z.number(),
    b: z.number(),
  }),
};

const calcTool = tool(calc, calcToolDescription);

// LLM Node

async function llmNode(
  state: typeof MessagesAnnotation.State,
  config: RunnableConfig
): Promise<typeof MessagesAnnotation.State> {
  console.log("Executing LLM Node");

  const baseModel = new ChatOpenAI({
    model: config.configurable?.modelName || "gpt-4o-mini",
  });

  const modelWithTools = baseModel.bindTools([calcTool]);

  const result = await modelWithTools.invoke(state.messages);

  return {
    messages: [result],
  };
}

// Initialize the graph
const graphBuilder = new StateGraph(MessagesAnnotation)
  // Add our node
  .addNode("llm", llmNode)
  .addNode("tools", new ToolNode([calcTool]))
  // Add edges to connect the nodes in sequence
  .addEdge(START, "llm")
  .addConditionalEdges("llm", toolsCondition)
  .addEdge("tools", "llm")
  .addEdge("tools", END);

// Compile the graph
export const graph = graphBuilder.compile();

const runtimeConfig: RunnableConfig = {
  configurable: {
    modelName: "gpt-4o-mini",
  },
  recursionLimit: 2, // Change this to see how it affects the execution
};

// Execute the graph
const main = async () => {
  console.log("\n=== Starting Graph Execution ===\n");

  const result = await graph.invoke(
    {
      messages: [new HumanMessage("What is 1 + 1 + 1 * 4 / 2 * 6?")],
    },
    runtimeConfig
  );

  console.log("=== Graph Execution Complete ===");
  console.log(
    "Final state:",
    result.messages[result.messages.length - 1].content
  );
};

main()
  .then(() => console.log("Graph execution completed successfully"))
  .catch(console.error); // You'll get an instance of GraphRecursionError here if the recursion limit is reached
