import "@langchain/langgraph/zod";
import {
  StateGraph,
  START,
  END,
  Annotation,
  MessagesAnnotation,
} from "@langchain/langgraph";
import { z } from "zod";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

// First node
function firstNode(
  state: typeof MessagesAnnotation.State
): typeof MessagesAnnotation.State {
  console.log("Executing Node 1");
  return {
    messages: [new HumanMessage("John stares at a screen for hours.")],
  };
}

function secondNode(
  state: typeof MessagesAnnotation.State
): typeof MessagesAnnotation.State {
  console.log("Executing Node 2");
  return {
    messages: [new HumanMessage("What does John drink?")], // No need to add the previous messages manually
  };
}

function thirdNode(
  state: typeof MessagesAnnotation.State
): typeof MessagesAnnotation.State {
  console.log("Executing Node 3");
  return {
    messages: [new AIMessage("He drinks coffee.")], // No need to add the previous messages manually
  };
}
// Initialize the graph
const graphBuilder = new StateGraph(MessagesAnnotation)
  // Add our node
  .addNode("first", firstNode)
  .addNode("second", secondNode)
  .addNode("third", thirdNode)
  // Add edges to connect the nodes in sequence
  .addEdge(START, "first")
  .addEdge("first", "second")
  .addEdge("second", "third")
  .addEdge("third", END);

// Compile the graph
export const graph = graphBuilder.compile();

// Execute the graph
const main = async () => {
  console.log("\n=== Starting Graph Execution ===\n");

  const result = await graph.invoke({ messages: [] });

  console.log("=== Graph Execution Complete ===");
  console.log("Final state:", result);
};

main()
  .then(() => console.log("Graph execution completed successfully"))
  .catch(console.error);
