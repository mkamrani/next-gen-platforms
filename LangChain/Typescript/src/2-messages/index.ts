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

const main = async () => {
  const messages: BaseMessage[] = [
    new SystemMessage(
      "You are a helpful assistant that responds in a concise manner and simplifies technical stuff"
    ),
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
