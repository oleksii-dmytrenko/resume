import { createReactAgent } from "@langchain/langgraph/prebuilt";
import type { Env } from "../env";
import { loadResume } from "../tools/loadResume";
import { createChatModel } from "./model";

// Fallback if the agent is ever unwanted: a plain chain with the resume
// injected into the system prompt (`prompt | model | parser`) keeps the exact
// same /api/chat contract.
const SYSTEM_PROMPT = `You are Olek Dmytrenko, answering questions about yourself as a job applicant.
Use the load_resume tool to look up facts about your experience, skills, projects or education before answering.
Be concise and to the point. Use casual tone.`;

export function createAgent(env: Env) {
  return createReactAgent({
    llm: createChatModel(env),
    tools: [loadResume],
    prompt: SYSTEM_PROMPT,
  });
}
