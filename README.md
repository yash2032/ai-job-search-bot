# 🤖 AI Job Search Bot

An automated AI-powered job discovery system that fetches, filters, and delivers **relevant, fresh job opportunities** directly to Telegram.

---

# 🚀 Features

* 🔍 Scrapes jobs from LinkedIn and Naukri
* 🧠 AI-powered resume-based job scoring
* 📅 Automated job alerts (twice daily)
* 💬 Telegram bot for real-time queries
* 🔐 Restricted access (only authorized user)

---

# 🏗️ Architecture Overview

```
User (Telegram)
        ↓
index.js (Bot Handler)
        ↓
Query Parsing (OpenAI)
        ↓
Job Fetching Layer
   ├── LinkedIn Scraper (Playwright)
   └── Naukri Scraper
        ↓
AI Scoring Engine
        ↓
Filtered Top Jobs
        ↓
Telegram Response
```

---

# ⚙️ Components

## 1. Telegram Bot (`index.js`)

* Handles incoming user messages
* Restricts access using `CHAT_ID`
* Orchestrates full pipeline:

  * Parse → Fetch → Score → Respond

---

## 2. Query Parser (`services/openai.js`)

* Converts natural language input into structured query:

```json
{
  "role": "Software Engineer",
  "location": "India",
  "company": "optional"
}
```

---

## 3. Job Fetcher (`services/jobs.js`)

### Sources:

* **LinkedIn**

  * Scraped using Playwright
  * Filters jobs within last 24 hours

* **Naukri**

  * Scraped using dynamic selectors
  * Supports experience + freshness filters

---

## 4. AI Scoring Engine (`services/scorer.js`)

* Uses OpenAI to evaluate:

  * Skills match
  * Role relevance
  * Experience alignment

### Input:

* Resume profile (`profile.json`)
* Job description

### Output:

```json
{
  "score": 85,
  "reason": "Strong backend + Java match"
}
```

---

## 5. Resume Profile (`profile.json`)

Structured representation of candidate:

```json
{
  "roles": [...],
  "skills": [...],
  "experience": "...",
  "keywords": [...]
}
```

---

## 6. Scheduler (`scheduler.js`)

* Runs job pipeline automatically
* Used in GitHub Actions

---

## 7. GitHub Actions (Automation)

Triggers job fetching:

```yaml
schedule:
  - cron: "30 7 * * *"   # 1 PM IST
  - cron: "30 12 * * *"  # 6 PM IST
```

---

# 🔄 System Modes

## 🟢 Real-time Mode

* Triggered via Telegram messages
* Uses `index.js`

## 🟡 Scheduled Mode

* Triggered via GitHub Actions
* Uses `scheduler.js`

---

# 🔐 Security

* Bot access restricted via:

```env
CHAT_ID=your_telegram_id
```

* Unauthorized users are blocked

---

# 🧪 Local Setup

```bash
git clone <repo>
cd job-bot

npm install
npx playwright install --with-deps

# add .env
node index.js
```

---

# 🔑 Environment Variables

```env
OPENAI_API_KEY=xxx
TELEGRAM_TOKEN=xxx
CHAT_ID=xxx
TAVILY_API_KEY=xxx (optional)
```

---

# ⚠️ Known Limitations

* LinkedIn scraping may hit authwall
* Naukri selectors may break occasionally
* Duplicate jobs not filtered (yet)
* GitHub Actions cron may have slight delays

---

# 🚀 Future Improvements

* ✅ Duplicate job filtering
* 📊 Better scoring heuristics
* 📦 Persistent storage (DB)
* 🌐 Multi-user support
* ⚡ Webhook-based Telegram bot

---

# 📌 Tech Stack

* Node.js
* Playwright
* OpenAI API
* Telegram Bot API
* GitHub Actions

---

# 👨‍💻 Author

Built as a personal AI system to automate job discovery and filtering.

---

# ⭐ If you find this useful

Give it a star and extend it for your own workflow 🚀
