import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Study Spark backend is running");
});

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    apiKeyFound: !!process.env.GEMINI_API_KEY
  });
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
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY missing in Render environment variables"
      });
    }

    const promptText = req.body.prompt || "";
    const mode = req.body.mode || "summarize";
    const file = req.file;

    if (!promptText && !file) {
      return res.status(400).json({
        error: "Prompt ya file bhejo"
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const finalPrompt = buildPrompt(mode, promptText || "Explain this file clearly.");
    const parts = [{ text: finalPrompt }];

    if (file) {
      parts.push({
        inlineData: {
          data: file.buffer.toString("base64"),
          mimeType: file.mimetype
        }
      });
    }

    const result = await model.generateContent(parts);
    const text = result.response.text();

    return res.json({ result: text });
  } catch (error) {
    console.error("FULL ERROR:", error);
    console.error("MESSAGE:", error?.message);

    return res.status(500).json({
      error: error?.message || "AI response failed."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("API key found:", !!process.env.GEMINI_API_KEY);
});
