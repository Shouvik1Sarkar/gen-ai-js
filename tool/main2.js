import Groq from "groq-sdk";
import { tavily } from "@tavily/core";

import { configDotenv } from "dotenv";
configDotenv({ path: "./.env" });

const tvly = tavily({
  apiKey: process.env.TAVILY_API_KEY,
});
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function web_search({ query }) {
  const response = await tvly.search(query);

  //   console.log(response.results[0].content);
  const final_result = response.results.map((res) => res.content).join();

  return final_result;
  //   return response.results[0].content;
}

const available_tools = {
  web_search: web_search,
};
const system_prompt = `
          You are a smart AI assistant who answers to the queries asked. If any query requires the help of external tool help you can take the help from the tools you have access of:
          1. web_search({qeury}) ({query: string}) -> takes the string query and returns the answer of it.           
`;

const message_history = [
  {
    role: "system",
    content: system_prompt,
  },
  {
    role: "user",
    content: "When was iphone 16 launched?",
  },
];
export async function main() {
  const chatCompletion = await groq.chat.completions.create({
    temperature: 0,
    tools: [
      {
        type: "function",
        function: {
          name: "web_search",
          description:
            "Search the lastest information and real time data on internet.",
          parameters: {
            // JSON Schema object
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The seach query seach is based on.",
              },
            },
            required: ["query"],
          },
        },
      },
    ],
    messages: message_history,
    model: "openai/gpt-oss-20b",
  });
  //   console.log(chatCompletion.choices[0]?.message?.content || "");
  console.log("message ---> ", typeof chatCompletion.choices[0]?.message);
  const toolCall = chatCompletion.choices[0]?.message.tool_calls;

  //   console.log("before before", chatCompletion.choices[0]?.message);

  //   console.log("real before: ", toolCall);

  if (!toolCall) {
    message_history.push(chatCompletion.choices[0]?.message);
    console.log("HELLO...............");
    console.log(chatCompletion.choices[0]?.message?.content || ""); // hi how are u?
    return;
  }

  console.log("before -> ", toolCall);
  for (const tool of toolCall) {
    const tool_name = tool.function.name;
    const tool_params = JSON.parse(tool.function.arguments);
    console.log(tool_name);
    console.log(tool_params);
    // if (tool_name == "web_search") {
    //   const result = await web_search(JSON.parse(tool_params));
    //   console.log("---> ", result);
    // }

    const tool_result = await available_tools[tool_name](tool_params);

    message_history.push({
      tool_call_id: tool.id,
      role: "tool",
      name: tool_name,
      content: tool_result,
    });

    const chatCompletion2 = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      temperature: 0,
      messages: message_history,
      tools: [
        {
          type: "function",
          function: {
            name: "web_search",
            description:
              "Search the lastest information and real time data on internet.",
            parameters: {
              // JSON Schema object
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "The seach query seach is based on.",
                },
              },
              required: ["query"],
            },
          },
        },
      ],
    });

    console.log(JSON.stringify(chatCompletion2.choices[0]?.message, null, 2));
  }
}

main();
