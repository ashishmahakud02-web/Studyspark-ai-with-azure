import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function buildPrompt(mode, input) {
  if (mode === "summarize") {
    return `Summarize this study content in 4-6 clear and useful lines:

${input}`;
  }

  if (mode === "explain") {
    return `Explain this topic in simple, student-friendly language with clarity:

${input}`;
  }

  if (mode === "keypoints") {
    return `Extract the main key points from this text in bullet points:

${input}`;
  }

  return `Answer this user question like a smart AI assistant in a clear and helpful way:

${input}`;
}

app.post("/ask", async (req, res) => {
  try {
    const { mode, input } = req.body;
    const prompt = buildPrompt(mode, input);

    const response = await client.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "system",
          content: "You are an intelligent AI study assistant. Give clear, helpful, student-friendly answers. Keep summaries concise and explanations easy to understand."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    res.json({ result: response.output_text });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      result: "Something went wrong while generating the AI response."
    });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
