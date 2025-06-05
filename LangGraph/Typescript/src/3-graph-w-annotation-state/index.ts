import { StateGraph, START, END, Annotation } from "@langchain/langgraph";

// Define our state type
const SimpleGraphAnnotation = Annotation.Root({
  step: Annotation<number>,
});

// First node
function firstNode(
  state: typeof SimpleGraphAnnotation.State
): typeof SimpleGraphAnnotation.State {
  console.log("Executing Node 1");
  return {
    step: state.step + 1,
  };
}

// Second node
function secondNode(
  state: typeof SimpleGraphAnnotation.State
): typeof SimpleGraphAnnotation.State {
  console.log("Executing Node 2");
  return {
    step: state.step + 1,
  };
}

// Third node
function thirdNode(
  state: typeof SimpleGraphAnnotation.State
): typeof SimpleGraphAnnotation.State {
  console.log("Executing Node 3");
  return {
    step: state.step + 1,
  };
}

// Initialize the graph
const graphBuilder = new StateGraph(SimpleGraphAnnotation)
  // Add our nodes
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

  const result = await graph.invoke({
    step: 0,
  });

  console.log("=== Graph Execution Complete ===");
  console.log("Final state:", result);
};

main()
  .then(() => console.log("Graph execution completed successfully"))
  .catch(console.error);
