import { OpenAIEmbeddings } from "@langchain/openai";
import dotenv from "dotenv";

// load .env file
dotenv.config();

/*
Embeddings: 
Embedding models transform human language into a format that machines can understand and compare with speed and accuracy.
These models take text as input and produce a fixed-length array of floating point numbers that provides a numerical representation of the text's semantic meaning. 
With embeddings, we can search for similar text based on their semantic meaning instead of just string matching.
*/

const dotProduct = (a: number[], b: number[]) => {
  return a.reduce((sum, _, i) => sum + a[i] * b[i], 0);
};

const magnitude = (a: number[]) => {
  return Math.sqrt(a.reduce((sum, value) => sum + value * value, 0));
};

const cosineSimilarity = (a: number[], b: number[]) => {
  return dotProduct(a, b) / (magnitude(a) * magnitude(b));
};

const main = async () => {
  const embeddingModel = new OpenAIEmbeddings({
    modelName: "text-embedding-3-small",
  });

  const documents = [
    "Cowes are bigger than chickens.",
    "John is a software engineer.",
    "Vibe coding is a thing?",
  ];

  const embeddings = await embeddingModel.embedDocuments(documents);
  // console.log(embeddings);

  const query = "John is a programmer";
  const queryEmbedding = await embeddingModel.embedQuery(query);
  // console.log(queryEmbedding);

  const similarity = embeddings.map((embedding, index) => {
    return {
      document: documents[index],
      similarity: cosineSimilarity(embedding, queryEmbedding),
    };
  });
  console.log(similarity);

  const closestDocument = similarity.sort(
    (a, b) => b.similarity - a.similarity
  )[0];
  console.log("Closest Document: ", closestDocument.document);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((error) => {
    console.error(error);
  });
