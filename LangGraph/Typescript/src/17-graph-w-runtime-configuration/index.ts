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
import { RunnableConfig } from "@langchain/core/runnables";

// Load .env file
dotenv.config();

// LLM Node
// Nodes can be async functions too
async function llmNode(
  state: typeof MessagesAnnotation.State,
  config?: RunnableConfig
): Promise<typeof MessagesAnnotation.State> {
  console.log("Executing LLM Node");

  const modelName = config?.configurable?.modelName || "gpt-4o-mini";

  const model = new ChatOpenAI({
    model: modelName,
  });
  const result = await model.invoke(state.messages);
  return {
    messages: [result],
  };
}

const runtimeConfig: RunnableConfig = {
  configurable: {
    modelName: "gpt-4o-mini",
  },
};

// Initialize the graph
const graphBuilder = new StateGraph(MessagesAnnotation)
  // Add our node
  .addNode("llm", llmNode)
  // Add edges to connect the nodes in sequence
  .addEdge(START, "llm")
  .addEdge("llm", END);

// Compile the graph
export const graph = graphBuilder.compile();

// Execute the graph
const main = async () => {
  console.log("\n=== Starting Graph Execution ===\n");

  const result = await graph.invoke(
    {
      messages: [
        new HumanMessage("From which city will the AI invasion begin?"),
      ],
    },
    runtimeConfig
  );

  console.log("=== Graph Execution Complete ===");
  console.log("Final state:", result);
};

main()
  .then(() => console.log("Graph execution completed successfully"))
  .catch(console.error);
