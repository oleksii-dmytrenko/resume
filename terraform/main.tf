# Infrastructure for the resume Worker. Everything is hardcoded on purpose -
# the only inputs are environment variables on the machine running terraform:
#
#   CLOUDFLARE_API_TOKEN  - Cloudflare API token (provider auth, never stored here)
#
# Deploy flow (worker code + assets are deployed by wrangler, not terraform):
#   1. terraform apply                 (creates the resume-chats D1 database,
#                                      attaches the cv.olektech.com custom domain)
#   2. paste `terraform output resume_chats_database_id` into wrangler.jsonc
#                                      (the Worker binding needs the literal id;
#                                      wrangler cannot read it from terraform state)
#   3. npm run db:migrate:prod         (wrangler applies migrations/*.sql to the
#                                      database - terraform has no SQL support)
#   4. wrangler deploy                 (creates/updates the "resume" Worker)
#   5. wrangler secret put ANTHROPIC_API_KEY   (one-time, encrypted by Cloudflare)

terraform {
  required_version = ">= 1.5"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5"
    }
  }
}

provider "cloudflare" {}

# Resolves the account scoped to CLOUDFLARE_API_TOKEN. Replace with a literal
# account id if the token ever spans multiple accounts.
data "cloudflare_accounts" "account" {}

data "cloudflare_zone" "olektech" {
  filter = {
    name = "olektech.com"
  }
}

resource "cloudflare_workers_custom_domain" "cv" {
  account_id = data.cloudflare_accounts.account.result[0].id
  zone_id    = data.cloudflare_zone.olektech.id
  hostname   = "cv.olektech.com"
  service    = "resume"
}

# Transcripts for the site's "Ask Anything" chat. The database itself is
# terraform-managed; its tables and rows are wrangler's (see migrations/ and
# npm run db:migrate:prod). If it is ever replaced, the old rows do NOT come
# with it - check `terraform plan` for a replacement before applying.
resource "cloudflare_d1_database" "resume_chats" {
  account_id = data.cloudflare_accounts.account.result[0].id
  name       = "resume-chats"
}

# uuid (not id) is the raw database id wrangler.jsonc's binding expects.
output "resume_chats_database_id" {
  value = cloudflare_d1_database.resume_chats.uuid
}
