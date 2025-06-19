import "@langchain/langgraph/zod";
import {
  StateGraph,
  START,
  END,
  MessagesAnnotation,
} from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { z } from "zod";
import { tool } from "@langchain/core/tools";

// Load .env file
dotenv.config();

const model = new ChatOpenAI({
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

const agent = createReactAgent({
  llm: model,
  tools: [multiplyTool],
});

// Agent Node
async function agentNode(
  state: typeof MessagesAnnotation.State
): Promise<typeof MessagesAnnotation.State> {
  console.log("Executing Agent Node");

  const result = await agent.invoke(state);
  return result;
}

// Initialize the graph
const graphBuilder = new StateGraph(MessagesAnnotation)
  // Add our node
  .addNode("agent", agentNode)
  // Add edges to connect the nodes in sequence
  .addEdge(START, "agent")
  .addEdge("agent", END);

// Compile the graph
export const graph = graphBuilder.compile();

// Execute the graph
const main = async () => {
  console.log("\n=== Starting Graph Execution ===\n");

  const result = await graph.invoke({
    messages: [new HumanMessage("Multiply 2 and 3")],
  });

  console.log("=== Graph Execution Complete ===");
  console.log("Final state:", result);
};

main()
  .then(() => console.log("Graph execution completed successfully"))
  .catch(console.error);
