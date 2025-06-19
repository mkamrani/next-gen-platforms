# 3. Graph with Annotation State

In this lesson, you'll learn how to use **annotations** to define and manage state in your LangGraph workflows. This approach provides more structure and type safety compared to previous lessons.

---

## What You'll Learn

- What **annotations** are and why they're useful
- How to define state using the `Annotation` class
- How to build and execute a graph with annotated state

---

## Why Use Annotations?

Annotations help you:
- Clearly define the structure and types of your state
- Catch errors early with better type checking
- Make your code more readable and maintainable

This is especially helpful as your workflows grow more complex!

---

## Step-by-Step: Building a Graph with Annotation State

### 1. Define the State with Annotations

Instead of a plain TypeScript interface, we use the `Annotation` class to define our state:

```typescript
const SimpleGraphAnnotation = Annotation.Root({
  step: Annotation<number>,
});
```

This tells LangGraph that our state has a single property, `step`, which is a number.

### 2. Create Nodes

Each node function now uses the annotated state type. The logic is the same as before—each node increments the `step` counter:

```typescript
function firstNode(
  state: typeof SimpleGraphAnnotation.State
): typeof SimpleGraphAnnotation.State {
  console.log("Executing Node 1");
  return {
    step: state.step + 1,
  };
}

function secondNode(
  state: typeof SimpleGraphAnnotation.State
): typeof SimpleGraphAnnotation.State {
  console.log("Executing Node 2");
  return {
    step: state.step + 1,
  };
}

function thirdNode(
  state: typeof SimpleGraphAnnotation.State
): typeof SimpleGraphAnnotation.State {
  console.log("Executing Node 3");
  return {
    step: state.step + 1,
  };
}
```

### 3. Build the Graph

We add nodes and connect them in sequence, just like before:

```typescript
const graphBuilder = new StateGraph(SimpleGraphAnnotation)
  .addNode("first", firstNode)
  .addNode("second", secondNode)
  .addNode("third", thirdNode)
  .addEdge(START, "first")
  .addEdge("first", "second")
  .addEdge("second", "third")
  .addEdge("third", END);
```

### 4. Compile and Run the Graph

Compile the graph and execute it with an initial state:

```typescript
export const graph = graphBuilder.compile();

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
```

---

## Output

When you run this code, you'll see each node execute in order, and the final state will show `step: 3`:

```
=== Starting Graph Execution ===
Executing Node 1
Executing Node 2
Executing Node 3
=== Graph Execution Complete ===
Final state: { step: 3 }
Graph execution completed successfully
```

---

## Why is This Useful?

Using annotations makes your workflow definitions more robust and easier to extend. As you add more state fields or complex logic, annotations help keep everything organized and type-safe.

---

**Next:** In the following lessons, you'll see how to use annotations for more advanced state management and validation!