import fs from "fs";

const profile = JSON.parse(fs.readFileSync("profile.json", "utf-8"));

export async function scoreJobs(jobs, query) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `
You are a job matching engine.

Match jobs STRICTLY based on candidate profile.

Candidate Profile:
- Roles: ${profile.roles.join(", ")}
- Skills: ${profile.skills.join(", ")}
- Experience: ${profile.experience}

Instructions:
- Prioritize backend roles
- Prefer Java, Spring Boot, Kafka, React stack
- Reject unrelated tech (PHP, WordPress, etc.)
- Penalize senior roles (>5 years)
- Prefer relevant experience (2–4 years)

Return ONLY JSON:
[
  {
    "title": "",
    "company": "",
    "link": "",
    "score": 0-100,
    "reason": "",
    "apply": true
  }
]

Rules:
- Keep only relevant jobs
- Score realistically
- Preserve original link
`
        },
        {
          role: "user",
          content: JSON.stringify({
            query,
            jobs: jobs.slice(0, 25)
          })
        }
      ]
    })
  });

  const data = await res.json();
  const content = data.choices[0].message.content;

  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);

    console.error("Scoring parse error:", content);
    return [];
  }
}