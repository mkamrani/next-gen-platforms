import "@langchain/langgraph/zod";
import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { z } from "zod";

const InputState = z.object({
  number: z.number(),
});

const OutputState = z.object({
  mode: z.enum(["dark", "light"]),
});

// First node
function firstNode(
  state: z.infer<typeof InputState>
): z.infer<typeof OutputState> {
  console.log("Executing Node 1");
  return {
    mode: state.number > 0.5 ? "dark" : "light",
  };
}

// Initialize the graph
const graphBuilder = new StateGraph({
  state: InputState.merge(OutputState),
  input: InputState,
  output: OutputState,
})
  .addNode("first", firstNode)
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
