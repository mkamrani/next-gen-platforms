import { Document } from "@langchain/core/documents";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import dotenv from "dotenv";
import { VectorStore } from "@langchain/core/vectorstores";
import { ChatPromptTemplate } from "@langchain/core/prompts";

// load .env file
dotenv.config();

const generateDocuments = () => {
  const documents = [
    new Document({
      pageContent: "John is a software engineer at CoolCompany.",
      metadata: { source: "LinkedIn" },
    }),
    new Document({
      pageContent:
        "John's favorite programming language is JavaScript. Poor John!",
      metadata: { source: "Twitter" },
    }),
    new Document({
      pageContent: "Trees are green.",
      metadata: { source: "Github" },
    }),
    new Document({
      pageContent: "Chickens are smaller than cows.",
      metadata: { source: "Wikipedia" },
    }),
    new Document({
      pageContent: "Vibe coding is a thing.",
      metadata: { source: "Twitter" },
    }),
  ];
  return documents;
};

const createVectorStore = (): VectorStore => {
  const embeddingModel = new OpenAIEmbeddings({
    modelName: "text-embedding-3-small",
  });
  const vectorStore = new MemoryVectorStore(embeddingModel);
  return vectorStore;
};

const main = async () => {
  // A. Transform the knowledge base into embeddings and store them in a vector store
  const documents = generateDocuments();
  const vectorStore = createVectorStore();
  await vectorStore.addDocuments(documents);
  const retriever = vectorStore.asRetriever(2); // 2 is the number of documents to retrieve

  // B. Respond to the user's query using the retriever and the model
  const query =
    "Do you know a developer who works at CoolCompany? What is their favorite programming language?";

  // B-1. Retrieve the relevant documents
  const retrievedDocuments = await retriever.invoke(query);

  // B-2. Use the model to respond to the user's query with the additional information
  const model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
  });

  const systemPrompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are a helpful assistant. In addition to your built-in knowledge, 
      you have access to this information: {retrievedDocuments}`,
    ],
    ["human", "{query}"],
  ]);

  const messages = await systemPrompt.invoke({
    retrievedDocuments: retrievedDocuments.map((d) => d.pageContent).join("\n"),
    query,
  });

  const answer = await model.invoke(messages);
  console.log(answer.content);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((error) => {
    console.error(error);
  });
