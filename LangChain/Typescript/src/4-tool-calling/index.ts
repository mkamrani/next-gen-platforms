import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";
import { z } from "zod";

// load .env file
dotenv.config();

/*
 Tool:
  In LangChain, a tool is simply a function with an associated schema defining the function's name, description, and the arguments it accepts.
*/

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

const main = async () => {
  const model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
  });
  const modelWithTools = model.bindTools([multiplyTool]);

  const messages: BaseMessage[] = [new HumanMessage("What is 2 * 3?")];

  const aiMessage: AIMessage = await modelWithTools.invoke(messages);
  console.log(aiMessage);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((error) => {
    console.error(error);
  });
