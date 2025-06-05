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
// Load .env file
dotenv.config();

const baseModel = new ChatOpenAI({
  model: "gpt-4o-mini",
});

const multiply = ({ a, b }: { a: number; b: number }): number => {
  return a * b;
};

const multiplyToolDescription = {
  name: "multiply",
  description: "Multiply two numbers",
  schema: z.object({
    a: z.number(),
    b: z.number(),
  }),
};

const multiplyTool = tool(multiply, multiplyToolDescription);

// LLM Node

async function llmNode(
  state: typeof MessagesAnnotation.State
): Promise<typeof MessagesAnnotation.State> {
  console.log("Executing LLM Node");

  const modelWithTools = baseModel.bindTools([multiplyTool]);

  const result = await modelWithTools.invoke(state.messages);

  return {
    messages: [result],
  };
}

// Initialize the graph
const graphBuilder = new StateGraph(MessagesAnnotation)
  // Add our node
  .addNode("llm", llmNode)
  .addNode("tools", new ToolNode([multiplyTool])) // The name must be "tools"
  // Add edges to connect the nodes in sequence
  .addEdge(START, "llm")
  .addConditionalEdges("llm", toolsCondition)
  .addEdge("tools", END);

// Compile the graph
export const graph = graphBuilder.compile();

// Execute the graph
const main = async () => {
  console.log("\n=== Starting Graph Execution ===\n");

  const result = await graph.invoke({
    messages: [new HumanMessage("What is 2 * 3?")],
  });

  console.log("=== Graph Execution Complete ===");
  console.log("Final state:", result);
};

main()
  .then(() => console.log("Graph execution completed successfully"))
  .catch(console.error);
