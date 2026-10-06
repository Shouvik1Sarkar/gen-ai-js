import Groq from "groq-sdk";
import { configDotenv } from "dotenv";
configDotenv({ path: "./.env" });

import readline from "node:readline/promises";

import { tavily } from "@tavily/core";

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

async function webSearch({ query }) {
  const response = await tvly.search(query);

  const result = response.results.map((e) => e.content).join();

  return result;
}

const available_tools = {
  webSearch,
};

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const system_prompt = `Hey you are an smart AI assistant named Jarvis. You answer the solutions to the queries asked to you. If you are incapable of answering any query You are also capable of using tools listed. Answers must be precise and to the point.
current Date ${new Date().toUTCString()}
`;

const message_history = [
  {
    role: "system",
    content: system_prompt,
  },
  //   {
  //     role: "user",
  //     content: "What is the current weather of Kolkata?",
  //   },
];
console.log("***Type `abort` to end conversation***");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
export async function main() {
  while (true) {
    const user_input = await rl.question("👉 ");

    // rl.close();
    // console.log("user input", user_input);

    if (user_input.toLowerCase() == "abort") {
      console.log("Thanks for the conversation");
      rl.close();
      break;
    }
    message_history.push({
      role: "user",
      content: user_input,
    });
    while (true) {
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
        console.log("🤖: ", chatCompletion?.choices[0]?.message?.content || "");
        break;
      }

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
}

main();
