import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
    const promptText = req.body.prompt || "";
    const mode = req.body.mode || "summarize";
    const file = req.file;

    const finalPrompt = buildPrompt(mode, promptText);
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

    res.json({ result: text });
  } catch (error) {
    console.error("FULL ERROR:", error);
    console.error("MESSAGE:", error?.message);

    res.status(500).json({
      error: error.message || "AI response failed."
    });
  }
});

console.log("API key found:", !!process.env.GEMINI_API_KEY);

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});
