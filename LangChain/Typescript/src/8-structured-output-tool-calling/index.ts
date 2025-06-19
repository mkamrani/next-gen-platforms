import { tool } from "@langchain/core/tools";
import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";
import { z } from "zod";

// load .env file
dotenv.config();

const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().int().min(0),
});

const responseFormatter = (schema: z.ZodSchema) =>
  tool(() => {}, {
    name: "responseFormatter",
    description: "Format the response to the provided schema",
    schema: schema,
  });

const main = async () => {
  const model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
  });

  const modelWithTools = model.bindTools([responseFormatter(UserSchema)]);

  const response = await modelWithTools.invoke(
    "John Doe is a new user. He's Twenty Five years old and his email is john.doe@example.com."
  );

  console.log(response);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((error) => {
    console.error(error);
  });
