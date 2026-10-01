import { UAParser } from "ua-parser-js";
import type { Context } from "hono";
import type { Env } from "./env";

// ua-parser-js is pinned to ^1 deliberately: from v2 the library is
// AGPLv3/commercial dual-licensed, while v1 stays MIT. The raw user_agent
// column keeps the source string, so anything mis-bucketed can be
// re-derived exactly later.
function collectVisitorInfo(c: Context<{ Bindings: Env }>) {
  const cf = c.req.raw.cf;
  const header = (name: string) => c.req.header(name);
  const userAgent = header("user-agent") ?? "";
  const { browser, os } = new UAParser(userAgent).getResult();
  return {
    ip: header("cf-connecting-ip") ?? null,
    country: cf?.country ?? null,
    region: cf?.region ?? null,
    city: cf?.city ?? null,
    latitude: cf?.latitude ?? null,
    longitude: cf?.longitude ?? null,
    timezone: cf?.timezone ?? null,
    asn: cf?.asn ?? null,
    asOrganization: cf?.asOrganization ?? null,
    colo: cf?.colo ?? null,
    userAgent: userAgent || null,
    browser: browser.name ?? null,
    // v1 labels macOS "Mac OS"; the modern name reads better in queries
    os: os.name === "Mac OS" ? "macOS" : os.name ?? null,
    language: header("accept-language")?.split(",")[0].trim() || null,
  };
}

// Upserted on every turn: first_seen sticks from the insert, everything else
// refreshes so a returning visitor on a new network/browser shows the latest.
function recordVisitor(c: Context<{ Bindings: Env }>, sessionId: string): Promise<D1Result> {
  const v = collectVisitorInfo(c);
  return c.env.DB.prepare(
    `INSERT INTO chat_visitors
       (session_id, ip, country, region, city, latitude, longitude, timezone,
        asn, as_organization, colo, user_agent, browser, os, language)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(session_id) DO UPDATE SET
       ip = excluded.ip, country = excluded.country, region = excluded.region,
       city = excluded.city, latitude = excluded.latitude,
       longitude = excluded.longitude, timezone = excluded.timezone,
       asn = excluded.asn, as_organization = excluded.as_organization,
       colo = excluded.colo, user_agent = excluded.user_agent,
       browser = excluded.browser, os = excluded.os,
       language = excluded.language,
       last_seen = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`
  )
    .bind(
      sessionId, v.ip, v.country, v.region, v.city, v.latitude, v.longitude,
      v.timezone, v.asn, v.asOrganization, v.colo, v.userAgent, v.browser,
      v.os, v.language
    )
    .run();
}

export { recordVisitor };
