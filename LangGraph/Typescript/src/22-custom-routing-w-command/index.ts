import "@langchain/langgraph/zod";
import {
  StateGraph,
  START,
  END,
  MessagesAnnotation,
  Send,
  Annotation,
  Command,
} from "@langchain/langgraph";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";
import { z } from "zod";

// Load .env file
dotenv.config();

const baseModel = new ChatOpenAI({
  model: "gpt-4o-mini",
});

const RouterOutput = z.object({
  route: z.enum(["positive", "negative"]),
});

const CustomMessagesAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  step: Annotation<number>({
    default: () => 0,
    reducer: (_, v) => v,
  }),
});

// LLM Node
// Nodes can be async functions too
async function routerNode(
  state: typeof CustomMessagesAnnotation.State
): Promise<Command> {
  console.log("Executing LLM Node");
  const model = baseModel.withStructuredOutput(RouterOutput);

  const result = await model.invoke([
    new SystemMessage("What is user's sentiment?"),
    ...state.messages,
  ]);

  console.log("Router result:", result);
  return new Command({
    update: {
      messages: state.messages,
      step: state.step + 1,
    },
    goto: result.route === "positive" ? "positive" : "negative",
  });
}

async function positiveNode(
  state: typeof CustomMessagesAnnotation.State
): Promise<typeof CustomMessagesAnnotation.State> {
  console.log("Executing Positive Node");

  const result = await baseModel.invoke([
    new SystemMessage(
      "You are a storyteller. You are given a message and you need to write 4 sentences story about it. The character's name should be Mr.Happy."
    ),
    ...state.messages,
  ]);

  return {
    messages: [result],
    step: state.step + 1,
  };
}

async function negativeNode(
  state: typeof CustomMessagesAnnotation.State
): Promise<typeof CustomMessagesAnnotation.State> {
  console.log("Executing Negative Node");

  const result = await baseModel.invoke([
    new SystemMessage(
      "You are a storyteller. You are given a message and you need to write 4 sentences story about it. The character's name should be Mr.Sad."
    ),
    ...state.messages,
  ]);

  return { messages: [result], step: state.step + 1 };
}

// Initialize the graph
const graphBuilder = new StateGraph(CustomMessagesAnnotation)
  // Add our node
  .addNode("router", routerNode, {
    ends: ["positive", "negative"],
  })
  .addNode("positive", positiveNode)
  .addNode("negative", negativeNode)
  // Add edges to connect the nodes in sequence
  .addEdge(START, "router")
  .addEdge("positive", END)
  .addEdge("negative", END);

// Compile the graph
export const graph = graphBuilder.compile();

// Execute the graph
const main = async () => {
  console.log("\n=== Starting Graph Execution ===\n");

  const result = await graph.invoke({
    messages: [
      new HumanMessage("I am feeling happy. Tell me a story about a frog."),
    ],
  });

  console.log("=== Graph Execution Complete ===");
  console.log("Final state:", result);
};

main()
  .then(() => console.log("Graph execution completed successfully"))
  .catch(console.error);
