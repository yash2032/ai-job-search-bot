import fs from "fs";
import { fetchLinkedInJobs } from "./linkedin.js";
import { fetchNaukriJobs } from "./naukri.js";

const profile = JSON.parse(fs.readFileSync("profile.json", "utf-8"));

export async function searchJobs(query) {
  const results = [];

  const role = query.role || "software engineer";
  const location = query.location || "India";

  const skills = profile.skills;

  // 🔥 MULTI-QUERY STRATEGY
  const searchQueries = [
    `${role} ${skills[0]} ${skills[1]}`,
    `${role} ${skills[0]} ${skills[2]}`,
    `${role} ${skills[1]} ${skills[2]}`,
    `${role} backend developer`,
    `${skills[0]} developer`
  ];

  console.log("Search Queries:", searchQueries);

  // ✅ LinkedIn
  console.log("Fetching LinkedIn jobs...");
  const linkedinJobs = await fetchLinkedInJobs(searchQueries, location);

  linkedinJobs.forEach(job => {
    results.push({
      title: job.title,
      company: job.company || "Unknown",
      link: job.link,
      description: "",
      source: "linkedin"
    });
  });

  console.log("LinkedIn jobs:", linkedinJobs.length);

  // ✅ Naukri
  console.log("Fetching Naukri jobs...");
  const naukriJobs = await fetchNaukriJobs(searchQueries, location);

  naukriJobs.forEach(job => {
    results.push({
      title: job.title,
      company: job.company || "Unknown",
      link: job.link,
      description: "",
      source: "naukri"
    });
  });

  console.log("Naukri jobs:", naukriJobs.length);

  return deduplicate(results);
}


// 🧹 Deduplicate
function deduplicate(jobs) {
  const seen = new Set();
  return jobs.filter(j => {
    if (!j.link || seen.has(j.link)) return false;
    seen.add(j.link);
    return true;
  });
}