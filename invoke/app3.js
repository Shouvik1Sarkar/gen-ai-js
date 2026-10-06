import Groq from "groq-sdk";
import { configDotenv } from "dotenv";
configDotenv({ path: "./.env" });

import { z } from "zod";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// const SentimentSchema = z.object({
//   sentiment: z.enum(["positive", "negative", "neutral"]),
// });

async function main() {
  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    temperature: 1,
    max_completion_tokens: 1000,
    // frequency_penalty: 1,
    // presence_penalty: 1,
    // response_format: { type: "json_object" }, // old
    // response_format: {
    //   type: "json_schema",
    //   json_schema: {
    //     name: "sentiment_response",
    //     schema: {
    //       type: "object",
    //       properties: {
    //         sentiment: {
    //           type: "string",
    //           enum: ["positive", "negative", "neutral"],
    //         },
    //       },
    //       required: ["sentiment"],
    //       additionalProperties: false,
    //     },
    //   },
    // }, // new

    messages: [
      {
        role: "system",
        content: `
        You are a interview grader assistant. Your task to generate candidate evaluation score.

        Output must be following JSON structure:

        {
          "confidence": number (1-10 scale),
          "accuracy": number (1-10 scale),
          "pass": boolean (true or false)
        }

        The response must:
        1. Include ALL fields shown above
        2. Use only the exact field names shown
        3. Follow the exact data types specified
        4. Contain ONLY the JSON object and nothing else
        `,
      },
      {
        role: "user",
        content: `Q: What does === do in JavaScript?
                  A: It checks strict equality—both value and type must match.

                  Q: How do you create a promise that resolves after 1 second?
                  A: const p = new Promise(r => setTimeout(r, 1000));

                  Q: What is hoisting?
                  A: JavaScript moves declarations (but not initializations) to the top of their scope before code runs.

                  Q: Why use let instead of var?
                  A: let is block-scoped, avoiding the function-scope quirks and re-declaration issues of var.`,
      },
    ],
  });
  const parsed_data = JSON.parse(completion.choices[0]?.message?.content);
  console.log("Parsed data: ", parsed_data);
  // const validateData = SentimentSchema.parse(parsed_data);
  // console.log("Zod validated data: ", validateData);
  //   console.log(completion);
}
main().catch(console.error);

// Zod
