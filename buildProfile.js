import dotenv from "dotenv";
import fs from "fs";
import { buildProfile } from "./services/profile.js";

dotenv.config();

const profile = await buildProfile();

if (!profile) {
  console.log("❌ Failed to build profile");
  process.exit(1);
}

fs.writeFileSync("profile.json", JSON.stringify(profile, null, 2));

console.log("✅ Profile generated successfully");