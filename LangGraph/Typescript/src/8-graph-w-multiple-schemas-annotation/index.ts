import "@langchain/langgraph/zod";
import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { z } from "zod";

const InputState = Annotation.Root({
  number: Annotation<number>(),
});

const OutputState = Annotation.Root({
  mode: Annotation<"dark" | "light">(),
});

// First node
function firstNode(state: typeof InputState.State): typeof OutputState.State {
  console.log("Executing Node 1");
  return {
    mode: state.number > 0.5 ? "dark" : "light",
  };
}

// Initialize the graph
const graphBuilder = new StateGraph({
  input: InputState,
  output: OutputState,
})
  // Add our node
  .addNode("first", firstNode)
  // Add edges to connect the nodes in sequence
  .addEdge(START, "first")
  .addEdge("first", END);

// Compile the graph
export const graph = graphBuilder.compile();

// Execute the graph
const main = async () => {
  console.log("\n=== Starting Graph Execution ===\n");

  const result = await graph.invoke({ number: Math.random() });

  console.log("=== Graph Execution Complete ===");
  console.log("Final state:", result);
};

main()
  .then(() => console.log("Graph execution completed successfully"))
  .catch(console.error);
