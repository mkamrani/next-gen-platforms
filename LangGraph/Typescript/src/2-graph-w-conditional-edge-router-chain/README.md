# 2. Graph with Conditional Edge

In this lesson, you'll learn how to add **conditional routing** to your LangGraph workflows. This builds on the previous lesson by introducing dynamic decision-making in your graph's flow.

---

## What You'll Learn

- How to use **conditional edges** to route data based on logic
- How to define a routing function
- How execution can branch in a graph

---

## Recap: What is a Graph?

Previously, you built a simple chain of nodes. Each node executed in sequence. But what if you want your workflow to make decisions and take different paths? That's where **conditional edges** come in!

---

## Step-by-Step: Building a Conditional Graph

### 1. Define the State

We use the same state as before—a simple counter:

```typescript
interface SimpleGraphState {
  step: number;
}
```

### 2. Set Up State Channels

Channels manage how state is updated:

```typescript
const graphStateChannels = {
  step: {
    value: (prevStep: number, newStep: number) => newStep,
    default: () => 0,
  },
};
```

### 3. Create Nodes

Each node increments the `step` counter and logs its execution:

```typescript
function firstNode(state: SimpleGraphState): SimpleGraphState {
  console.log("Executing Node 1");
  return { step: state.step + 1 };
}

function secondNode(state: SimpleGraphState): SimpleGraphState {
  console.log("Executing Node 2");
  return { step: state.step + 1 };
}

function thirdNode(state: SimpleGraphState): SimpleGraphState {
  console.log("Executing Node 3");
  return { step: state.step + 1 };
}
```

### 4. Build the Graph with Conditional Routing

Here's where things get interesting! We use `addConditionalEdges` to decide which node to run after `first`:

```typescript
const graphBuilder = new StateGraph({ channels: graphStateChannels })
  .addNode("first", firstNode)
  .addNode("second", secondNode)
  .addNode("third", thirdNode)
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
```

- After the `first` node, the graph uses a **routing function** to randomly choose between `second` and `third`.
- This simulates a decision point—your logic could be based on state, user input, or model output!

### 5. Compile and Run the Graph

```typescript
export const graph = graphBuilder.compile();

const main = async () => {
  console.log("\n=== Starting Graph Execution ===\n");

  const result = await graph.invoke({ step: 0 });

  console.log("=== Graph Execution Complete ===");
  console.log("Final state:", result);
};

main()
  .then(() => console.log("Graph execution completed successfully"))
  .catch(console.error);
```

---

## Output

When you run this code, you'll see either Node 2 or Node 3 execute after Node 1, depending on the random routing:

```
=== Starting Graph Execution ===
Executing Node 1
Executing Node 2
=== Graph Execution Complete ===
Final state: { step: 2 }
Graph execution completed successfully
```

or

```
=== Starting Graph Execution ===
Executing Node 1
Executing Node 3
=== Graph Execution Complete ===
Final state: { step: 2 }
Graph execution completed successfully
```
