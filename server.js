import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
const upload = multer({ storage: multer.memoryStorage() });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

app.get("/", (req, res) => {
  res.send("Study Spark backend is running");
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

app.post("/ask", upload.single("file"), async (req, res) => {
  try {
    const { mode, input } = req.body;
    const prompt = buildPrompt(mode, input);

    const response = await openai.chat.completions.create({
      model: "gemini-3.5-flash",
      messages: [
        { role: "user", content: prompt }
      ]
    });

    res.json({
      result: response.choices[0].message.content
    });
  } catch (error) {
    console.error("FULL ERROR:", error);
    console.error("MESSAGE:", error?.message);
    console.error("STATUS:", error?.status);
    console.error("RESPONSE:", error?.response?.data);

    res.status(500).json({
      result: "AI response failed."
    });
  }
});

console.log("API key found:", !!process.env.GEMINI_API_KEY);

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});
