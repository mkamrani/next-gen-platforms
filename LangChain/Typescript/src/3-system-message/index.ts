import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";

// load .env file
dotenv.config();

/*
 Message:
  In LangChain, messages are the unit of communication in chat models, used to represent model input and output.
*/
const model = new ChatOpenAI({
  modelName: "gpt-4o-mini",
});

const getRandomSystemMessage = (number: number) => {
  const content =
    number > 0.5
      ? `You are an English speaking assistant and only respond in English. You always provide examples in your responses if applicable.`
      : `You are a Spanish speaking assistant and only respond in Spanish. You always provide examples in your responses if applicable.`;
  const message: SystemMessage = new SystemMessage(content);
  return message;
};

const main = async () => {
  const messages: BaseMessage[] = [
    getRandomSystemMessage(Math.random()),
    new HumanMessage("How long till AI takes over?"),
  ];

  const response: AIMessage = await model.invoke(messages);
  const answer = response.content;
  console.log(answer);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((error) => {
    console.error(error);
  });
