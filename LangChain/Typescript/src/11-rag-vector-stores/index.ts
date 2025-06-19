import { Document } from "@langchain/core/documents";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import dotenv from "dotenv";
import { VectorStore } from "@langchain/core/vectorstores";

// load .env file
dotenv.config();

/*
Vector Stores: 
The embeddings (in form of vectors) are normally stored in a special data store called a vector store.
A vector store not only stores the embeddings, but also provides an efficient way to search for similar text based on their semantic meaning.

*/

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

  const query = "John is a programmer";
  const results = await vectorStore.similaritySearch(query, 1);
  console.log("Results: ", results);
  const filteredResults = await vectorStore.similaritySearch(
    query,
    1,
    (doc: Document) => {
      return doc.metadata?.source === "Twitter";
    }
  );
  console.log("Filtered Results: ", filteredResults);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((error) => {
    console.error(error);
  });
