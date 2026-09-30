# 👋 Olek's Resume — with a built-in AI me

🚀 My personal resume site at [cv.olektech.com](https://cv.olektech.com/) — with **"Ask Anything About Me"**,
a chat that answers questions about my experience using an AI agent that has actually read my CV.

[🌐 Live site](https://cv.olektech.com) | [🐙 My GitHub](https://github.com/oleksii-dmytrenko) | [💼 LinkedIn](https://www.linkedin.com/in/olek-dmytrenko-606953b1/) | [📧 o@olektech.com](mailto:o@olektech.com)

---

## ✨ What's inside

- 🗣️ **AI chat** — ask about my experience, skills, availability or timezone; answers stream in real time
- 📄 **Grounded answers** — the agent looks facts up from my CV via a `load_resume` tool instead of guessing
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
**Infra:** Cloudflare Workers + static assets · Hono routes · Terraform for the custom domain

---

## 🚀 Run it locally

```bash
cp .dev.vars.example .dev.vars   # add your ANTHROPIC_API_KEY
npm install
npm run dev                      # UI on http://localhost:5173, worker on :8787
```

The UI proxies chat requests to the worker, so `localhost:5173` is the full stack.

## 📦 Deploy

```bash
npm run deploy                   # builds the site and ships the Worker
```

Pushes to `main` deploy automatically via GitHub Actions. The Anthropic key lives only as an
encrypted Cloudflare secret — never in the repo.

> *"Build fast. Learn faster. Iterate always."*
