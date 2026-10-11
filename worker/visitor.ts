import Bowser from "bowser";
import type { Context } from "hono";
import type { Env } from "./env";

// Upserted on every turn: first_seen sticks from the insert, everything else
// refreshes so a returning visitor on a new network/browser shows the latest.
function recordVisitor(c: Context<{ Bindings: Env }>, sessionId: string): Promise<D1Result> {
  const cf = c.req.raw.cf;
  const header = (name: string) => c.req.header(name);
  // Bowser.parse throws on an empty string; requests may carry no UA header
  const ua = header("user-agent");
  const agent = ua ? Bowser.parse(ua) : undefined;
  // row key order must match the INSERT column order; Object.values feeds
  // bind() with undefined normalized to null (D1 rejects undefined)
  const row = {
    ip: header("cf-connecting-ip"),
    country: cf?.country,
    region: cf?.region,
    city: cf?.city,
    latitude: cf?.latitude,
    longitude: cf?.longitude,
    timezone: cf?.timezone,
    asn: cf?.asn,
    asOrganization: cf?.asOrganization,
    colo: cf?.colo,
    userAgent: ua,
    browser: agent?.browser.name,
    os: agent?.os.name,
    language: header("accept-language")?.split(",")[0].trim(),
  };
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
    .bind(sessionId, ...Object.values(row).map((v) => v ?? null))
    .run();
}

export { recordVisitor };
