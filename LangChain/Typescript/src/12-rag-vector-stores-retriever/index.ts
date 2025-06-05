import { Document } from "@langchain/core/documents";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import dotenv from "dotenv";
import { VectorStore } from "@langchain/core/vectorstores";

// load .env file
dotenv.config();

const generateDocuments = () => {
  const documents = [
    new Document({
      pageContent: "John is a software engineer.",
      metadata: { source: "LinkedIn" },
    }),
    new Document({
      pageContent: "John is a developer.",
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
  const documents = generateDocuments();
  const vectorStore = createVectorStore();
  await vectorStore.addDocuments(documents);
  const retriever = vectorStore.asRetriever(2); // 2 is the number of documents to retrieve

  const query = "John is a programmer";
  const retrievedDocuments = await retriever.invoke(query);
  console.log("Retrieved Documents: ", retrievedDocuments);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((error) => {
    console.error(error);
  });
