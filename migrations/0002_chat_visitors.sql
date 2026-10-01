-- One row per chat visitor (chat_sid cookie), refreshed on every turn.
-- Geo columns come from Cloudflare's request.cf data (city-level accuracy);
-- browser/os are parsed from the User-Agent, with the raw string kept in
-- user_agent so it can be re-parsed exactly later.
CREATE TABLE chat_visitors (
  session_id TEXT PRIMARY KEY,
  ip TEXT,
  country TEXT,
  region TEXT,
  city TEXT,
  latitude TEXT,
  longitude TEXT,
  timezone TEXT,
  asn INTEGER,
  as_organization TEXT,
  colo TEXT,
  user_agent TEXT,
  browser TEXT,
  os TEXT,
  language TEXT,
  first_seen TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  last_seen TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
