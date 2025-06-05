import { BaseChatModel } from "@langchain/core/dist/language_models/chat_models";
import { AIMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";

// load .env file
dotenv.config();

/*
 Chat Model:
  In LangChain, a chat model is an LLM exposed via a chat API that process sequences of messages as input and output a message.
*/

const createChatModel = (): BaseChatModel => {
  return new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0.8,
    maxTokens: 100,
  });
};

const main = async () => {
  const model = createChatModel();
  const response: AIMessage = await model.invoke(
    "In a sentence, how long till AI takes over?"
  );
  console.log(response);
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
