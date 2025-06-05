import "@langchain/langgraph/zod";
import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { z } from "zod";

const InputState = Annotation.Root({
  number: Annotation<number>(),
});

const FooState = Annotation.Root({
  foo: Annotation<string>(),
});

const BarState = Annotation.Root({
  bar: Annotation<string>(),
});

const FooBarState = Annotation.Root({
  ...FooState.spec,
  ...BarState.spec,
  baz: Annotation<string>, // Just in case you want to add a field to the merged state
});

const OutputState = Annotation.Root({
  message: Annotation<string>(),
});

// First node
function firstNode(
  state: typeof InputState.State
): Partial<typeof FooState.State> {
  console.log("Executing Node 1");
  return {
    foo: state.number > 0.5 ? "Big Foo" : "Small Foo",
  };
}

function secondNode(
  state: typeof InputState.State
): Partial<typeof BarState.State> {
  console.log("Executing Node 2");
  return {
    bar: state.number > 0.5 ? "Big Bar" : "Small Bar",
  };
}

function thirdNode(state: typeof FooBarState.State): typeof OutputState.State {
  console.log("Executing Node 3");
  return {
    message: `Now we have ${state.foo} and ${state.bar}`,
  };
}
// Initialize the graph
const graphBuilder = new StateGraph({
  stateSchema: FooBarState, // This must include all the fields from all the states
  input: InputState,
  output: OutputState,
})
  // Add our node
  .addNode("first", firstNode)
  .addNode("second", secondNode)
  .addNode("third", thirdNode)
  // Add edges to connect the nodes in sequence
  .addEdge(START, "first")
  .addEdge(START, "second")
  .addEdge("first", "third")
  .addEdge("second", "third")
  .addEdge("third", END);

// Compile the graph
export const graph = graphBuilder.compile();

// Execute the graph
const main = async () => {
  console.log("\n=== Starting Graph Execution ===\n");

  const result = await graph.invoke({
    number: Math.random(),
  });

  console.log("=== Graph Execution Complete ===");
  console.log("Final state:", result);
};

main()
  .then(() => console.log("Graph execution completed successfully"))
  .catch(console.error);
