import { chromium } from "playwright";

export async function fetchNaukriJobs(queries, location = "India") {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let allJobs = [];

  for (const query of queries) {
    try {
      const formatted = query.replace(/\s+/g, "-");

      const url = `https://www.naukri.com/${formatted}-jobs-in-${location.replace(/\s+/g, "-")}?experience=2&jobAge=1`;

      console.log("Naukri URL:", url);

      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });

      // wait a bit for dynamic load
      await page.waitForTimeout(3000);

      // scroll once (important)
      await page.evaluate(() => window.scrollBy(0, 1000));

      // try multiple selectors (Naukri changes DOM often)
      const jobs = await page.evaluate(() => {
        const cards =
          document.querySelectorAll(".jobTuple") ||
          document.querySelectorAll(".srp-jobtuple-wrapper");

        return Array.from(cards).slice(0, 10).map(card => {
          const title =
            card.querySelector("a.title")?.innerText?.trim() ||
            card.querySelector("a")?.innerText?.trim();

          const company =
            card.querySelector(".companyInfo")?.innerText?.trim() ||
            card.querySelector(".subTitle")?.innerText?.trim();

          const link = card.querySelector("a")?.href;

          return { title, company, link };
        });
      });

      allJobs = allJobs.concat(jobs);

      // delay to avoid blocking
      await page.waitForTimeout(1500);

    } catch (err) {
      console.log("Naukri scraping failed for query:", query);
      console.log("Error:", err.message);
      continue; // 🔥 skip and continue
    }
  }

  await browser.close();

  return allJobs.filter(j => j.title && j.link);
}