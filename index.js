import dotenv from "dotenv";
import { parseQuery } from "./services/openai.js";
import { searchJobs } from "./services/jobs.js";
import { scoreJobs } from "./services/scorer.js";

dotenv.config();

const TOKEN = process.env.TELEGRAM_TOKEN;
const BASE_URL = `https://api.telegram.org/bot${TOKEN}`;

let offset = 0;
let isPolling = false;

async function poll() {
  if (isPolling) return;
  isPolling = true;

  try {
    const res = await fetch(`${BASE_URL}/getUpdates?offset=${offset}`);
    const data = await res.json();

    if (!data.ok || !Array.isArray(data.result)) {
      console.error("Telegram API Error:", data);
      return;
    }

    for (const update of data.result) {
      offset = update.update_id + 1;

      const message = update.message?.text;
      const chatId = update.message?.chat.id;

      if (!message) continue;

      console.log("Chat ID:", chatId);
      console.log("User:", message);

      // 🔐 Restrict access
      const allowedChatId = process.env.CHAT_ID;
      if (chatId.toString() !== allowedChatId) {
        console.log("Unauthorized access attempt:", chatId);

        await fetch(`${BASE_URL}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "⛔ You are not authorized to use this bot."
          })
        });

        continue;
      }

      try {
        // 🧠 Parse query
        const query = await parseQuery(message);

        // 🔎 Fetch jobs
        const jobs = await searchJobs(query);

        if (!jobs.length) {
          await sendMessage(chatId, "No jobs found.");
          continue;
        }

        // ⭐ Score jobs
const scoredJobs = await scoreJobs(jobs, query);

// 🎯 Filter
let topJobs = scoredJobs
  .filter(j => j.score >= 60)
  .slice(0, 20);

// fallback
if (!topJobs.length) {
  topJobs = scoredJobs.slice(0, 10);
}

// 🔥 PRIORITIZE LINKEDIN (fresh jobs first)
const linkedinJobs = topJobs.filter(j => j.link.includes("linkedin.com"));
const otherJobs = topJobs.filter(j => !j.link.includes("linkedin.com"));

topJobs = [...linkedinJobs, ...otherJobs].slice(0, 15);

// 🧾 Response
let response = `🔥 Top ${topJobs.length} Fresh Jobs For You\n\n`;

topJobs.forEach((job, i) => {
  response += `${i + 1}. ${job.title} - ${job.company}\n`;
  response += `⭐ ${job.score}% match\n`;
  response += `💡 ${job.reason}\n`;
  response += `🔗 ${job.link}\n\n`;
});
        

        // 💬 Send response
        await sendMessage(chatId, response);

      } catch (innerError) {
        console.error("Processing error:", innerError);
        await sendMessage(chatId, "⚠️ Something went wrong. Try again.");
      }
    }
  } catch (err) {
    console.error("Polling error:", err);
  } finally {
    isPolling = false;
  }
}

// 🔧 helper to send message
async function sendMessage(chatId, text) {
  await fetch(`${BASE_URL}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text
    })
  });
}

setInterval(poll, 2500);

console.log("🚀 Bot running...");