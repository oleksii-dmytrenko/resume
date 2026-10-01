import type { Context } from "hono";
import type { Env } from "./env";

// Coarse UA sniffing - only needs to be right about the common browsers so
// visitors group into "Chrome 130 on Windows"-style buckets. The raw
// user_agent column keeps the source string, so anything mis-parsed can be
// re-derived exactly later. Order matters: Edge/Opera/Samsung all include a
// Chrome token, and Chrome UAs include a Safari token.
function parseBrowser(ua: string): string {
  const rules: [string, RegExp][] = [
    ["Edge", /Edg(?:e|A|iOS)?\/([\d.]+)/],
    ["Opera", /(?:OPR|Opera)[\s/]([\d.]+)/],
    ["Samsung Internet", /SamsungBrowser\/([\d.]+)/],
    ["Firefox", /(?:Firefox|FxiOS)\/([\d.]+)/],
    ["Chrome", /(?:Chrome|CriOS)\/([\d.]+)/],
    ["Safari", /Version\/([\d.]+)\sSafari/],
  ];
  for (const [name, re] of rules) {
    const match = ua.match(re);
    if (match) return `${name} ${parseInt(match[1], 10)}`;
  }
  return "";
}

function parseOs(ua: string): string {
  if (/Windows NT/.test(ua)) return "Windows";
  const android = ua.match(/Android\s([\d.]+)/);
  if (android) return `Android ${android[1].split(".")[0]}`;
  if (/iPhone|iPad|iPod/.test(ua)) {
    const ios = ua.match(/OS\s(\d+[_.]\d+)/);
    return ios ? `iOS ${ios[1].replace("_", ".")}` : "iOS";
  }
  if (/Mac OS X/.test(ua)) return "macOS";
  if (/\bLinux\b|X11/.test(ua)) return "Linux";
  return "";
}

function collectVisitorInfo(c: Context<{ Bindings: Env }>) {
  const cf = c.req.raw.cf;
  const header = (name: string) => c.req.header(name);
  // CF-Connecting-IP is the single real client IP at the edge; the XFF
  // fallback only matters in local dev.
  const forwarded = header("x-forwarded-for");
  const ip =
    header("cf-connecting-ip") ?? (forwarded ? forwarded.split(",")[0].trim() : null);
  const userAgent = header("user-agent") ?? "";
  return {
    ip,
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
    browser: parseBrowser(userAgent) || null,
    // sec-ch-ua-platform (low-entropy client hint) as an OS fallback
    os: parseOs(userAgent) || header("sec-ch-ua-platform") || null,
    language: header("accept-language")?.split(",")[0].trim() || null,
  };
}

// Upserted on every turn: first_seen sticks from the insert, everything else
// refreshes so a returning visitor on a new network/browser shows the latest.
async function recordVisitor(c: Context<{ Bindings: Env }>, sessionId: string): Promise<void> {
  const v = collectVisitorInfo(c);
  try {
    await c.env.DB.prepare(
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
  } catch (error) {
    console.error("failed to persist chat visitor:", error);
  }
}

export { recordVisitor };
