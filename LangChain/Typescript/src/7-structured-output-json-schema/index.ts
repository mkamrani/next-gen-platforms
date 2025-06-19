import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";

// load .env file
dotenv.config();

const main = async () => {
  const model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
  });

  const schema = {
    type: "object",
    properties: {
      user: { type: "string" },
      age: { type: "integer" },
      email: { type: "string", format: "email" },
    },
    required: ["user", "age", "email"],
  };
  const modelWithStructuredOutput = model.withStructuredOutput(schema);
  const user = await modelWithStructuredOutput.invoke(
    "John Doe, john.doe@example.com, 25"
  );
  console.log(user);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((error) => {
    console.error(error);
  });
