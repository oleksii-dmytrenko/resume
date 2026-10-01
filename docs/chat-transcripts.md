# Chat transcript storage (internal runbook)

Not part of the public README — operational details for the `resume-chats`
Cloudflare D1 database that backs the "Ask Anything" chat.

## What is stored

Two tables in `resume-chats`:

- **`chat_messages`** — one row per message: `session_id` (a 90-day `chat_sid`
  cookie groups a visitor's turns into one conversation), `role`, `text`, UTC
  `created_at`.
- **`chat_visitors`** — one upserted row per conversation with what the request
  reveals: IP, Cloudflare geo (`country`, `region`, `city`, `latitude`/
  `longitude`, `timezone`, `asn`/`as_organization`, `colo` edge datacenter),
  parsed `browser` and `os` (raw `user_agent` kept for exact re-parsing), and
  `language`. Refreshed on every turn; `first_seen`/`last_seen` bracket the
  conversation.

Writes are fire-and-forget via `waitUntil` — a DB outage never breaks the
chat itself. IP + geo are personal data under GDPR: the tables are
deliberately narrow, and dropping or hashing `ip` is a one-line change.

## One-time setup

The database is terraform-managed (requires `CLOUDFLARE_API_TOKEN` in the
environment, see `terraform/main.tf`):

```bash
cd terraform && terraform apply        # creates resume-chats (+ the custom domain)
terraform output -raw resume_chats_database_id   # paste into wrangler.jsonc
cd .. && npm run db:migrate:prod
```

If terraform ever wants to *replace* the database, stop — a replacement is
empty and the old transcripts stay behind on the old one. The id is also
recoverable by name with `npx wrangler d1 info resume-chats`.

## Inspecting

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
