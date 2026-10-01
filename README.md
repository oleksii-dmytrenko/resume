# 👋 Olek's Resume — with a built-in AI me

🚀 My personal resume site at [cv.olektech.com](https://cv.olektech.com/) — with **"Ask Anything About Me"**,
a chat that answers questions about my experience using an AI agent that has actually read my CV.

[🌐 Live site](https://cv.olektech.com) | [🐙 My GitHub](https://github.com/oleksii-dmytrenko) | [💼 LinkedIn](https://www.linkedin.com/in/olek-dmytrenko-606953b1/) | [📧 o@olektech.com](mailto:o@olektech.com)

---

## ✨ What's inside

- 🗣️ **AI chat** — ask about my experience, skills, availability or timezone; answers stream in real time
- 📄 **Grounded answers** — the agent looks facts up from my CV via a `load_resume` tool instead of guessing
- 🧠 **Recruiter FAQ knowledge base** — screening questions (rate, notice period, location, English, agentic experience) are answered from a plain-text FAQ compiled from real recruiter chats, served via a `load_faq` tool
- 🛡️ **Scope guardrails** — the agent answers only about Olek's professional background and the personal context he has published; general questions, coding help, and prompt-injection or persona-hijack attempts get a one-line friendly redirect
- 💾 **Conversation storage** — every chat turn is persisted to a Cloudflare D1 database, grouped per visitor by an httpOnly session cookie, so transcripts are queryable with SQL later
- 📱 **One page, four views** — About Me, Expertise, Experience and Why Me, with smooth transitions
- ⚡ **Fast & simple** — a single Cloudflare Worker serves both the site and the chat API, no extra backend to babysit

---

## 🛠️ Tech Stack

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Framer](https://img.shields.io/badge/Framer-0055FF?style=for-the-badge&logo=framer&logoColor=white)

![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)
![Hono](https://img.shields.io/badge/Hono-E36002?style=for-the-badge&logo=hono&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-000000?style=for-the-badge&logo=langchain&logoColor=white)
![Claude](https://img.shields.io/badge/Claude-191919?style=for-the-badge&logo=anthropic&logoColor=white)
![Terraform](https://img.shields.io/badge/Terraform-623CE4?style=for-the-badge&logo=terraform&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

**Frontend:** React + TypeScript + Vite, Tailwind, framer-motion, [deep-chat](https://deepchat.dev)
**AI:** LangGraph agent · Claude (Anthropic) · streamed replies over SSE
**Infra:** Cloudflare Workers + static assets · Hono routes · D1 for chat transcripts · Terraform for the custom domain

---

## 🚀 Run it locally

```bash
cp .dev.vars.example .dev.vars   # add your ANTHROPIC_API_KEY
npm install
npm run db:migrate               # create the local D1 chat_transcript tables
npm run dev                      # UI on http://localhost:5173, worker on :8787
```

The UI proxies chat requests to the worker, so `localhost:5173` is the full stack.

## 💾 Chat transcripts (Cloudflare D1)

Every turn of the "Ask Anything" chat is stored in the `resume-chats` D1
database. Two tables:

- **`chat_messages`** — one row per message: `session_id` (a 90-day `chat_sid`
  cookie groups a visitor's turns into one conversation), `role`, `text`, UTC
  `created_at`.
- **`chat_visitors`** — one row per conversation with what the request
  reveals: IP, Cloudflare geo (`country`, `region`, `city`, `latitude`/
  `longitude`, `timezone`, `asn`/`as_organization`, `colo` edge datacenter),
  parsed `browser` and `os` (raw `user_agent` kept for exact re-parsing), and
  `language`. Refreshed on every turn; `first_seen`/`last_seen` bracket the
  conversation.

Writes are fire-and-forget — a DB outage never breaks the chat itself.

One-time setup (requires `CLOUDFLARE_API_TOKEN` in the environment, see
`terraform/main.tf`):

```bash
cd terraform && terraform apply        # creates resume-chats (+ the custom domain)
terraform output -raw resume_chats_database_id   # paste into wrangler.jsonc
cd .. && npm run db:migrate:prod
```

Then `npm run deploy` as usual. The database lives in terraform (it's in
`main.tf` and in terraform state); the tables and rows are managed by wrangler
migrations, which terraform cannot run. If terraform ever wants to *replace*
the database, stop — a replacement is empty and the old transcripts stay
behind on the old one. The id is also recoverable by name afterwards with
`npx wrangler d1 info resume-chats`.

Then `npm run deploy` as usual. Inspect conversations with:

```bash
# most recent conversations
npx wrangler d1 execute resume-chats --remote --command \
  "SELECT session_id, count(*) AS turns FROM chat_messages GROUP BY session_id ORDER BY max(id) DESC LIMIT 10"

# most frequently asked questions
npx wrangler d1 execute resume-chats --remote --command \
  "SELECT lower(text) AS question, count(*) AS asks FROM chat_messages WHERE role='user' GROUP BY lower(text) ORDER BY asks DESC LIMIT 10"

# recent visitors with geo/browser and their message count
npx wrangler d1 execute resume-chats --remote --command \
  "SELECT v.country, v.city, v.browser, v.os, v.ip, v.last_seen, count(m.id) AS messages FROM chat_visitors v JOIN chat_messages m ON m.session_id = v.session_id GROUP BY v.session_id ORDER BY v.last_seen DESC LIMIT 10"
```

(Drop `--remote` to inspect the local dev database.)

## 📦 Deploy

```bash
npm run deploy                   # builds the site and ships the Worker
```

Pushes to `main` deploy automatically via GitHub Actions. The Anthropic key lives only as an
encrypted Cloudflare secret — never in the repo.

> *"Build fast. Learn faster. Iterate always."*
