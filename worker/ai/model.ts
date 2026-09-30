import { ChatAnthropic } from "@langchain/anthropic";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { Env } from "../env";

// The only place that knows which LLM provider is in use. Swapping providers
// means returning a different BaseChatModel implementation here (e.g.
// ChatOpenAI from @langchain/openai) - the agent and endpoint stay unchanged.
export function createChatModel(env: Env): BaseChatModel {
  return new ChatAnthropic({
    anthropicApiKey: env.ANTHROPIC_API_KEY,
    model: "claude-sonnet-4-5",
  });
}
