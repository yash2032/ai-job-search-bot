import { searchJobs } from "./services/jobs.js";
import { scoreJobs } from "./services/scorer.js";
import { parseQuery } from "./services/openai.js";

const CHAT_ID = process.env.CHAT_ID;
const TOKEN = process.env.TELEGRAM_TOKEN;
const BASE_URL = `https://api.telegram.org/bot${TOKEN}`;

async function sendMessage(text) {
  await fetch(`${BASE_URL}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text,
    }),
  });
}

async function runJob() {
  try {
    console.log("🚀 Running job...");

    const query = await parseQuery("software engineer jobs");

    const jobs = await searchJobs(query);
    const scoredJobs = await scoreJobs(jobs, query);

    let topJobs = scoredJobs.filter((j) => j.score >= 60).slice(0, 20);

    if (!topJobs.length) {
      topJobs = scoredJobs.slice(0, 10);
    }

    const linkedinJobs = topJobs.filter((j) => j.link.includes("linkedin.com"));
    const others = topJobs.filter((j) => !j.link.includes("linkedin.com"));

    topJobs = [...linkedinJobs, ...others].slice(0, 15);

    let message = `🔥 Daily Job Alert\n\n`;

    topJobs.forEach((job, i) => {
      message += `${i + 1}. ${job.title} - ${job.company}\n`;
      message += `⭐ ${job.score}% match\n`;
      message += `🔗 ${job.link}\n\n`;
    });

    await sendMessage(message);

    console.log("✅ Jobs sent successfully");
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

// 🔥 RUN IMMEDIATELY AND EXIT
await runJob();
