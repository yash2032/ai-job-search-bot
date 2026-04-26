import { chromium } from "playwright";

export async function fetchLinkedInJobs(queries, location = "India") {
  const browser = await chromium.launch({
    headless: false // 🔥 IMPORTANT (avoid detection)
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
  });

  const page = await context.newPage();

  let allJobs = [];

  for (const query of queries.slice(0, 3)) { // 🔥 limit queries
    try {
      const url = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&f_TPR=r86400`;

      console.log("LinkedIn URL:", url);

      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });

      // 🔥 detect authwall
      if (page.url().includes("authwall")) {
        console.log("⚠️ LinkedIn blocked request, skipping...");
        continue;
      }

      await page.waitForTimeout(3000);

      // scroll to load jobs
      await page.evaluate(() => window.scrollBy(0, 1500));

      const jobs = await page.evaluate(() => {
        const cards = document.querySelectorAll(".base-card");

        return Array.from(cards).slice(0, 10).map(card => {
          const title = card.querySelector("h3")?.innerText?.trim();
          const company = card.querySelector("h4")?.innerText?.trim();
          const link = card.querySelector("a")?.href;

          return { title, company, link };
        });
      });

      allJobs = allJobs.concat(jobs);

      // 🔥 delay between queries (VERY IMPORTANT)
      await page.waitForTimeout(4000);

    } catch (err) {
      console.log("LinkedIn scraping failed for query:", query);
      console.log("Error:", err.message);
      continue;
    }
  }

  await browser.close();

  return allJobs.filter(j => j.title && j.link);
}