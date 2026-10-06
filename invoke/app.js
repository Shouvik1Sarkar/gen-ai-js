import Groq from "groq-sdk";
import { configDotenv } from "dotenv";
configDotenv({ path: "./.env" });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    temperature: 1,
    max_completion_tokens: 1000,
    // frequency_penalty: 1,
    // presence_penalty: 1,
    // response_format: { type: "json_object" }, // old
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "sentiment_response",
        schema: {
          type: "object",
          properties: {
            sentiment: {
              type: "string",
              enum: ["positive", "negative", "neutral"],
            },
          },
          required: ["sentiment"],
          additionalProperties: false,
        },
      },
    }, // new

    messages: [
      {
        role: "system",
        content: `You are Jarvis, a smart review grader. Your task is to analyze given review and return the sentiment. Classify the review as positive, neutral pr negative. Output must be valid json structure.
        
        example: {"sentiment": "String"}
        `,
      },
      {
        role: "user",
        content: `Review: These eadphones arrived quickly and look great but the left earcup stopped working after a week.
        Sentiment:`,
      },
    ],
  });
  const parsed_data = JSON.parse(completion.choices[0]?.message?.content);
  console.log(parsed_data);
  //   console.log(completion);
}
main().catch(console.error);

// Zod
