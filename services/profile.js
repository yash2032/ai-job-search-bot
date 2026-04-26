import fs from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

export async function buildProfile() {
  try {
    const dataBuffer = fs.readFileSync("resume.pdf");

    // 📄 Extract text from PDF
    const pdfData = await pdf(dataBuffer);
    const resumeText = pdfData.text;

    console.log("Extracted text length:", resumeText.length);

    // 🤖 Send to OpenAI
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0,
        messages: [
          {
            role: "system",
            content: `
You are a resume parser.

Return ONLY valid JSON.
Do NOT include any explanation.

Format:
{
  "roles": [],
  "skills": [],
  "experience": "",
  "keywords": []
}
`
          },
          {
            role: "user",
            content: resumeText
          }
        ]
      })
    });

    const result = await res.json();

    const content = result.choices[0].message.content;

    // ✅ Safe JSON parsing
    try {
      return JSON.parse(content);
    } catch (e) {
      // fallback: extract JSON from text
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }

      console.error("Profile parse failed:", content);
      return null;
    }

  } catch (err) {
    console.error("Profile build error:", err);
    return null;
  }
}