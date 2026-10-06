import Groq from "groq-sdk";
import { configDotenv } from "dotenv";
configDotenv({ path: "./.env" });

// Node cache

import NodeCache from "node-cache";

import readline from "node:readline/promises";

import { tavily } from "@tavily/core";
import { threadId } from "node:worker_threads";

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

const myCache = new NodeCache({ stdTTL: 60 * 60 * 24 }); // 24 hours

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function webSearch({ query }) {
  const response = await tvly.search(query);

  const result = response.results.map((e) => e.content).join();

  return result;
}

const available_tools = {
  webSearch,
};

console.log("***Type `abort` to end conversation***");

const system_prompt = `
You are a smart personal assistant. Your name is Jarvis.

If you know the answer to a question, answer it directly in plain English.

If the answer requires real-time, local, or up-to-date information, or if you don’t know the answer, use the available tools to find it.

You have access to the following tool:

webSearch(query: string): Use this to search the internet for current or unknown information.

Decide when to use your own knowledge and when to use the tool.

Do not mention the tool unless needed.

For normal conversational answers, respond in plain prose.
Do not use Markdown headings, bullet lists, bold formatting, or tables
unless they materially improve the answer or the user requests them.

Examples:

Q: Hi!
A: Hey I am Jarvis...(rest of the chat)

Q: What is the capital of France?
A: The capital of France is Paris.
💡

Q: What’s the weather in Mumbai right now?
A: (use the search tool to find the latest weather and try to return in plain english and plain text. Unless asked in any particular format like markdown explicitly.)

Q: Who is the Prime Minister of India?
A: The current Prime Minister of India is Narendra Modi.

Q: Tell me the latest IT news.
A: (use the search tool to get the latest news)

current date and time: ${new Date().toUTCString()},
`;

const base_message_history = [
  {
    role: "system",
    content: system_prompt,
  },
  //   {
  //     role: "user",
  //     content: "What is the current weather of Kolkata?",
  //   },
];
export async function generate(user_input, threadId) {
  const message_history = myCache.get(threadId) ?? base_message_history;
  // const message_history = base_message_history;

  message_history.push({
    role: "user",
    content: user_input,
  });
  const MAX_TRIES = 10;
  let count = 0;
  while (true) {
    if (count > MAX_TRIES) {
      return "failed to answer";
    }
    count += 1;
    const chatCompletion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: message_history,
      temperature: 0.5,

      tools: [
        {
          type: "function",
          function: {
            name: "webSearch",
            description:
              "Search the lastest information and real time data on internet.",
            parameters: {
              // JSON Schema object
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "The seach query on which search is based on.",
                },
              },
              required: ["query"],
            },
          },
        },
      ],
      tool_choice: "auto",
    });

    // Print the completion returned by the LLM.

    const tool_call = chatCompletion?.choices[0]?.message?.tool_calls;
    //   console.log("This is assistant", chatCompletion.choices[0]?.message);
    if (!tool_call) {
      message_history.push(chatCompletion.choices[0]?.message);
      myCache.set(threadId, message_history);
      // console.log("CACHE: ", myCache);

      return chatCompletion?.choices[0]?.message?.content || "";
    }
    message_history.push(chatCompletion.choices[0]?.message);

    for (const tool of tool_call) {
      console.log("Tool Calling...");
      const tool_name = tool.function.name;

      const query = JSON.parse(tool.function.arguments);
      //   console.log("---", chatCompletion?.choices[0]?.message);

      //   console.log(`TOOL-> ${tool_name} TYPE OF TOOL-> ${typeof tool_name}`);
      //   console.log(`QUERY-> ${query} TYPE OF QUERY ${typeof query}`);

      const result = await available_tools[tool_name](query);
      message_history.push({
        tool_call_id: tool.id,
        name: tool_name,
        role: "tool",
        content: result,
      });

      //   console.log(
      //     "Chat ---------> ",
      //     chatCompletion?.choices[0]?.message.content,
      //   );
    }
  }
}
