import { AIMessage, HumanMessage } from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  PromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";
import { z } from "zod";

// load .env file
dotenv.config();

const stringPromptTemplateExample = async (subject: string) => {
  const template = "What is a {subject}?";
  const promptTemplate = PromptTemplate.fromTemplate(template);
  const messages = await promptTemplate.invoke({ subject });
  console.log("StringPromptTemplate Messages: ", messages);
  return messages;
};

const chatPromptTemplateExample = async (subject: string) => {
  const template = "What is a {subject}?";
  const promptTemplate = ChatPromptTemplate.fromMessages([
    [
      "system",
      "You are a helpful assistant that answers questions with very short answers.",
    ],
    ["human", template],
  ]);
  const messages = await promptTemplate.invoke({ subject });
  console.log("ChatPromptTemplate Messages: ", messages);
  return messages;
};

const chatPromptTemplateMessagePlaceholderExample = async () => {
  const promptTemplate = ChatPromptTemplate.fromMessages([
    [
      "system",
      "You are a helpful assistant that answers questions with very short answers.",
    ],
    new MessagesPlaceholder("history"),
  ]);

  const messages = await promptTemplate.invoke({
    history: [
      new HumanMessage("What is a cat?"),
      new HumanMessage("Also what is a dog?"),
    ],
  });
  console.log("ChatPromptTemplateMessagePlaceholder Messages: ", messages);
  return messages;
};

const main = async () => {
  const model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
  });

  const messages = await stringPromptTemplateExample("cat");
  const response = await model.invoke(messages);
  console.log(response.content);

  console.log("================================================");

  const messages2 = await chatPromptTemplateExample("cat");
  const response2 = await model.invoke(messages2);
  console.log(response2.content);

  console.log("================================================");

  const messages3 = await chatPromptTemplateMessagePlaceholderExample();
  const response3 = await model.invoke(messages3);
  console.log(response3.content);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((error) => {
    console.error(error);
  });
