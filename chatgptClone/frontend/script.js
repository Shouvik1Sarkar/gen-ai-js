const input = document.getElementById("userInput");
const askButton = document.getElementById("askButton");
const chatContainer = document.getElementById("chatContainer");

let loading = document.createElement("div");
loading.className = "my-6 animate-pulse";
loading.innerHTML = "Thinking...";

const threadId =
  Date.now().toString(36) + Math.random().toString(36).substring(2, 9);

// ==========================================
// ADD USER MESSAGE -> RIGHT
// ==========================================

function addUserMessage(message) {
  const wrapper = document.createElement("div");

  wrapper.className = "flex justify-end";

  const messageDiv = document.createElement("div");

  messageDiv.className = `
        max-w-[70%]
        rounded-[15px]
        bg-[#242424]
        px-4
        py-3
        text-[16px]
      `;

  messageDiv.textContent = message;

  wrapper.appendChild(messageDiv);

  chatContainer.appendChild(wrapper);
  chatContainer.appendChild(loading);
}

// ==========================================
// ADD AI MESSAGE -> LEFT
// ==========================================

function addAIMessage(message) {
  const wrapper = document.createElement("div");

  wrapper.className = "flex justify-start";

  const messageDiv = document.createElement("div");

  messageDiv.className = `
        max-w-[70%]
        px-1
        py-2
        text-[16px]
      `;

  messageDiv.textContent = message;
  // messageDiv.innerHTML = marked.parse(message);

  wrapper.appendChild(messageDiv);

  loading.remove();

  chatContainer.appendChild(wrapper);
}

// ==========================================
// SEND MESSAGE
// ==========================================

async function sendMessage() {
  const message = input.value.trim();

  if (!message) return;

  // User -> right
  addUserMessage(message);

  // Clear input
  input.value = "";

  // Temporary fake AI response
  //   setTimeout(() => {
  //     // AI -> left
  //     addAIMessage("This is the response from the AI.");

  //     scrollToBottom();
  //   }, 500);
  const ai_message = await callServer(message, threadId);
  console.log("asssistant message", ai_message);
  addAIMessage(ai_message);
  scrollToBottom();
}

async function callServer(input_message, threadId) {
  const result = await fetch("http://localhost:3000/chat", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      threadId,
      message: input_message,
    }),
  });

  console.log("result ", result);
  console.log("result ", result.ok);
  if (!result.ok) {
    throw Error("Error getting result");
  }

  const data = await result.json();

  return data.message;
}

function scrollToBottom() {
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Ask button
askButton.addEventListener("click", async () => {
  await sendMessage();
});

// Enter = send
input.addEventListener("keydown", async (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();

    await sendMessage();
  }
});
