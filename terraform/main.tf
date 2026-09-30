# Infrastructure for the resume Worker. Everything is hardcoded on purpose -
# the only inputs are environment variables on the machine running terraform:
#
#   CLOUDFLARE_API_TOKEN  - Cloudflare API token (provider auth, never stored here)
#
# Deploy flow (worker code + assets are deployed by wrangler, not terraform):
#   1. wrangler deploy                 (creates/updates the "resume" Worker)
#   2. wrangler secret put ANTHROPIC_API_KEY   (one-time, encrypted by Cloudflare)
#   3. terraform apply                 (attaches the cv.olektech.com custom domain)

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
