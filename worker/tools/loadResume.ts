import { tool } from "@langchain/core/tools";
import { z } from "zod";

const DOC_ID = "1rLNO-tLTGXTvR9_KiIeCA_Lhk7F1U0stWZFH_s4g6N8";
const DOC_URL = `https://docs.google.com/document/d/${DOC_ID}/export?format=txt`;
const CACHE_KEY = "https://resume-cache.internal/resume.txt";
const CACHE_TTL_SECONDS = 3600;

async function fetchResume(): Promise<string> {
  // Workers isolates are ephemeral, so the resume is cached in the Cache API
  // instead of a module-level variable to survive isolate recycling.
  const cache = caches.default;
  const cached = await cache.match(CACHE_KEY);
  if (cached) return cached.text();

  const response = await fetch(DOC_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch resume (${response.status})`);
  }
  const text = await response.text();
  const res = new Response(text, {
    headers: { "Cache-Control": `public, max-age=${CACHE_TTL_SECONDS}` },
  });
  await cache.put(CACHE_KEY, res);
  return text;
}

export const loadResume = tool(
  async () => fetchResume(),
  {
    name: "load_resume",
    description:
      "Returns Olek Dmytrenko's full resume text (experience, skills, projects, education, contact). " +
      "Call this whenever a question needs facts about him.",
    schema: z.object({}),
  }
);
