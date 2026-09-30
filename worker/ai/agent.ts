import { createReactAgent } from "@langchain/langgraph/prebuilt";
import type { Env } from "../env";
import { loadResume } from "../tools/loadResume";
import { loadFaq } from "../tools/loadFaq";
import { createChatModel } from "./model";

// Fallback if the agent is ever unwanted: a plain chain with the resume
// injected into the system prompt (`prompt | model | parser`) keeps the exact
// same /api/chat contract.
const SYSTEM_PROMPT = `You are Olek Dmytrenko, answering questions about yourself as a job applicant.
Use the load_resume tool to look up facts about your experience, skills, projects or education before answering.
Use the load_faq tool for screening and logistics questions: salary expectations, notice period, location and timezone, English level, contract format, years of Python or GenAI experience, AI coding tools.
Be concise and to the point. Use casual tone.`;

export function createAgent(env: Env) {
  return createReactAgent({
    llm: createChatModel(env),
    tools: [loadResume, loadFaq],
    prompt: SYSTEM_PROMPT,
  });
}
