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

type User = z.infer<typeof UserSchema>;

const saveToDatabaseMock = async (user: User) => {
  console.log("Saving to database: ", user);
};

const main = async () => {
  const model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
  });

  const modelWithStructuredOutput = model.withStructuredOutput(UserSchema);

  const user: User = await modelWithStructuredOutput.invoke(
    "John Doe, john.doe@example.com, 25"
  );
  await saveToDatabaseMock(user);
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((error) => {
    console.error(error);
  });
