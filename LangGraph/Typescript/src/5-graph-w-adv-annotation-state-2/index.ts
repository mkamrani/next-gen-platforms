import { StateGraph, START, END, Annotation } from "@langchain/langgraph";

type TimedMessage = {
  message: string;
  timestamp: number;
};

const SimpleGraphAnnotation = Annotation.Root({
  step: Annotation<number>({
    default: () => 0,
    reducer: (_, v) => v,
  }),
  messages: Annotation<TimedMessage[]>({
    default: () => [],
    reducer: (current, update) => {
      console.log("Reducing arrays", current, update);
      return [...current, ...update];
    },
  }),
  initialTime: Annotation<number>,
  totalTimeElapsed: Annotation<number>,
});

// First node
function firstNode(
  state: typeof SimpleGraphAnnotation.State
): Partial<typeof SimpleGraphAnnotation.State> {
  console.log("Executing Node 1");
  console.log("initial state", state);
  return {
    step: state.step + 1,
    messages: [
      {
        message: "Hello from Node 1",
        timestamp: Date.now(),
      },
    ],
  };
}

// Second node
function secondNode(
  state: typeof SimpleGraphAnnotation.State
): Partial<typeof SimpleGraphAnnotation.State> {
  console.log("Executing Node 2");
  return {
    step: state.step + 1,
    messages: [
      {
        message: "Hello from Node 2",
        timestamp: Date.now(),
      },
    ],
  };
}

// Third node
function thirdNode(
  state: typeof SimpleGraphAnnotation.State
): Partial<typeof SimpleGraphAnnotation.State> {
  console.log("Executing Node 3");
  return {
    step: state.step + 1,
    messages: [
      {
        message: "Hello from Node 3",
        timestamp: Date.now(),
      },
    ],
    totalTimeElapsed: Date.now() - state.initialTime,
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
    messages: [],
    initialTime: Date.now(),
    totalTimeElapsed: 0,
  });

  console.log("=== Graph Execution Complete ===");
  console.log("Final state:", result);
};

main()
  .then(() => console.log("Graph execution completed successfully"))
  .catch(console.error);
