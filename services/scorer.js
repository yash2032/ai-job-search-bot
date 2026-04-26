import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

// 🔐 OpenAI setup
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 📂 Resolve profile.json path correctly
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const profilePath = path.join(__dirname, "../profile.json");

// 📄 Load profile safely
let profile = {};

try {
  const data = fs.readFileSync(profilePath, "utf-8");
  profile = JSON.parse(data);
  console.log("✅ Profile loaded. Skills:", profile.skills?.length || 0);
} catch (err) {
  console.log("⚠️ Failed to load profile:", err.message);
}

// 🧠 Extract safe values
const skills = profile.skills || [];
const experience = profile.experience || "";
const roles = profile.roles || [];

// 🎯 MAIN FUNCTION
export async function scoreJobs(jobs, query) {
  // 🔥 Fallback if profile is bad
  if (!Array.isArray(skills) || skills.length === 0) {
    console.log("⚠️ No skills found, using fallback scoring");

    return jobs.map((j) => ({
      ...j,
      score: 50,
      reason: "Default scoring (no profile data)",
    }));
  }

  const scoredJobs = [];

  for (const job of jobs.slice(0, 20)) {
    try {
      const prompt = `
You are a job matching assistant.

Candidate Profile:
Skills: ${skills.join(", ")}
Experience: ${experience}
Preferred Roles: ${roles.join(", ")}

Job:
Title: ${job.title}
Company: ${job.company}

Give:
1. Match score (0–100)
2. Short reason

Respond ONLY in JSON:
{
  "score": number,
  "reason": "text"
}
`;

      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      });

      const text = response.choices[0].message.content;

      let parsed;

      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = {
          score: 50,
          reason: "Parsing failed",
        };
      }

      scoredJobs.push({
        ...job,
        score: parsed.score || 50,
        reason: parsed.reason || "No reason",
      });
    } catch (err) {
      console.log("❌ Scoring failed:", err.message);

      scoredJobs.push({
        ...job,
        score: 50,
        reason: "Error during scoring",
      });
    }
  }

  return scoredJobs;
}
