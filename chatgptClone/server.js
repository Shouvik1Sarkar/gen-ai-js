import express, { json } from "express";
import cors from "cors";
import { generate } from "./chatbot.js";
const app = express();
const port = 3000;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.post("/chat", async (req, res) => {
  const { message, threadId } = req.body;
  // const { message, threadId } = req.body;
  console.log("message", message);

  if (!message || !threadId) {
    return res.status(400).json({ message: "All fields are required." });
  }
  console.log("This is it.");

  const result = await generate(message, threadId);

  return res.status(200).send({ message: result });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
