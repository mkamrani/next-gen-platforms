import { ToolCall } from "@langchain/core/dist/messages/tool";
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  ToolMessage,
} from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";
import { z } from "zod";

// load .env file
dotenv.config();

// Tools

const multiply = ({ a, b }: { a: number; b: number }): number => {
  return a * b;
};

const multiplyToolDescription = {
  name: "multiply",
  description: "Multiply two numbers",
  schema: z.object({
    a: z.number(),
    b: z.number(),
  }),
};

const multiplyTool = tool(multiply, multiplyToolDescription);

const add = ({ a, b }: { a: number; b: number }): number => {
  return a + b;
};

const addToolDescription = {
  name: "add",
  description: "Add two numbers",
  schema: z.object({
    a: z.number(),
    b: z.number(),
  }),
};

const addTool = tool(add, addToolDescription);

const tools = [multiplyTool, addTool];

const executeTool = async (
  tool_name: string,
  toolCall: ToolCall
): Promise<ToolMessage> => {
  const tool = tools.find((tool) => tool.name === tool_name);
  if (!tool) {
    throw new Error(`Tool ${tool_name} not found`);
  }
  const toolMessage: ToolMessage = (await tool.invoke(toolCall)) as ToolMessage;
  return toolMessage;
};

const main = async () => {
  const model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
  });
  const modelWithTools = model.bindTools(tools);

  let messages: BaseMessage[] = [
    new HumanMessage("What is the answer to 2 * 3, and 3 + 4?"),
  ];

  const aiMessage: AIMessage = await modelWithTools.invoke(messages);
  console.log(aiMessage);
  messages.push(aiMessage);

  // Execute tools
  for (const toolCall of aiMessage.tool_calls!) {
    const toolMessage = await executeTool(toolCall.name, toolCall);
    messages.push(toolMessage);
  }
  console.log("Messages: ", messages);

  const answer = await modelWithTools.invoke(messages);
  console.log(`Answer: ${answer.content}`);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((error) => {
    console.error(error);
  });
