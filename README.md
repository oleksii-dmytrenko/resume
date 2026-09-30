# Personal Resume Website

My AI-enhanced personal resume website. Visit [cv.olektech.com](https://cv.olektech.com/) to see it in action.

## Architecture

A single Cloudflare Worker serves everything:

- **Frontend** — React + TypeScript + Vite SPA (Tailwind, framer-motion), served as
  static assets by the Worker (`/`, `/expertise`, `/experience`, `/why-me`).
- **`POST /api/chat`** — Hono route running a LangGraph agent backed by Anthropic
  (`claude-sonnet-4-5`). The agent has a `load_resume` tool that fetches the resume
  from Google Docs (cached in the Workers Cache API). Replies stream to the UI as
  SSE `data: {"text": ...}` events, rendered by the [deep-chat](https://deepchat.dev)
  chat widget with visible conversation history.
- **Provider seam** — `worker/ai/model.ts` is the only file that knows which LLM
  provider is used; swapping providers is a one-function edit.
- **Infrastructure as code** — `terraform/main.tf` manages the `cv.olektech.com`
  custom domain (zero variables; auth via `CLOUDFLARE_API_TOKEN` env var). The
  Worker itself is deployed by `wrangler` from `wrangler.jsonc`. The Anthropic key
  is stored only as an encrypted Cloudflare Worker secret — never in the repo,
  tfvars, or Terraform state.

## Local development

```bash
cp .dev.vars.example .dev.vars   # add your ANTHROPIC_API_KEY
npm install
npm run dev                      # builds once, then runs vite (5173) + wrangler dev (8787)
```

Vite proxies `/api` to the worker, so http://localhost:5173 is the full stack.

## Deploy

```bash
npm run deploy                   # builds the SPA and deploys the Worker + assets
```

Pushes to `main` deploy automatically via GitHub Actions.

### One-time bootstrap

```bash
npm run deploy                          # creates the "resume" Worker
wrangler secret put ANTHROPIC_API_KEY   # encrypted by Cloudflare
cd terraform && terraform init && CLOUDFLARE_API_TOKEN=... terraform apply   # custom domain
```

Before applying the custom domain, detach `cv.olektech.com` from the old Cloudflare
Pages project (kept only as a rollback until the Worker is verified).
