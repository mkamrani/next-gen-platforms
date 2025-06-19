import { StateGraph, START, END, StateGraphArgs } from "@langchain/langgraph";

// Define our state type
interface SimpleGraphState {
  step: number;
}

// Define state channels with a simple reducer for the step counter
const graphStateChannels: StateGraphArgs<SimpleGraphState>["channels"] = {
  step: {
    value: (prevStep: number, newStep: number) => newStep,
    default: () => 0,
  },
};

/*
  Node:
  In LangGraph, a node is a function that takes a state and returns a state.

*/

// First node
function firstNode(state: SimpleGraphState): SimpleGraphState {
  console.log("Executing Node 1");
  return {
    step: state.step + 1,
  };
}

// Second node
function secondNode(state: SimpleGraphState): SimpleGraphState {
  console.log("Executing Node 2");
  return {
    step: state.step + 1,
  };
}

// Third node
function thirdNode(state: SimpleGraphState): SimpleGraphState {
  console.log("Executing Node 3");
  return {
    step: state.step + 1,
  };
}

/*
  Graph:
  In LangGraph, a graph is a collection of nodes and edges.
  It is a directed acyclic graph (DAG) that represents the flow of data through the system.
*/

// Initialize the graph
const graphBuilder = new StateGraph({ channels: graphStateChannels })
  // Add our nodes
  /*
    addNode(name, node) adds a node to the graph
  */
  .addNode("first", firstNode)
  .addNode("second", secondNode)
  .addNode("third", thirdNode)
  // Add edges to connect the nodes in sequence
  /*
    The START Node is a special node that represents the node sends user input to the graph. The main purpose for referencing this node is to determine which nodes should be called first.
    The END Node is a special node that represents a terminal node. This node is referenced when you want to denote which edges have no actions after they are done.
    addConditionalEdges(from, routingFunction) optionally routes to a different node based on the routing function
  */
  .addEdge(START, "first")
  .addConditionalEdges("first", (state) => {
    const randomNumber = Math.random();
    if (randomNumber < 0.5) {
      return "second";
    }
    return "third";
  })
  .addEdge("second", END)
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
