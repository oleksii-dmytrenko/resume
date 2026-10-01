import { Hono } from "hono";
import { AIMessage, HumanMessage, type BaseMessageLike } from "@langchain/core/messages";
import { getCookie } from "hono/cookie";
import { createAgent } from "./ai/agent";
import type { Env } from "./env";

const MAX_HISTORY_MESSAGES = 12;
const APOLOGY =
  "I apologize, but I encountered an error processing your question. Please try again later.";

const SESSION_COOKIE = "chat_sid";
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90 days
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface ChatMessage {
  role: "user" | "ai" | "assistant";
  text: string;
}

// deep-chat sends assistant messages with role "ai"; accept both spellings so
// past answers stay in the history the model sees.
function isChatMessage(m: unknown): m is ChatMessage {
  if (!m || typeof m !== "object") return false;
  const { role, text } = m as { role?: unknown; text?: unknown };
  return (
    (role === "user" || role === "ai" || role === "assistant") &&
    typeof text === "string" &&
    text.trim().length > 0
  );
}

function toLangChainMessages(messages: ChatMessage[]): BaseMessageLike[] {
  return messages.slice(-MAX_HISTORY_MESSAGES).map((m) =>
    m.role === "user" ? new HumanMessage(m.text) : new AIMessage(m.text)
  );
}

// deep-chat appends each SSE event's {text} to the streamed bubble, so deltas
// are sent as-is.
function sseChunk(delta: string): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify({ text: delta })}\n\n`);
}

// streamMode "messages" yields either protocol events ([data, metadata] with
// {event, delta}) or message instances, depending on model support. Tool
// results and human history also arrive on this channel, so only text deltas
// belonging to an AI message may reach the UI.
interface StreamRoleState {
  role: string;
}

function extractTextDelta(chunk: unknown, state: StreamRoleState): string {
  const value = Array.isArray(chunk) ? chunk[0] : chunk;
  if (value && typeof value === "object") {
    if ("event" in value) {
      const event = value as {
        event: string;
        role?: string;
        delta?: { type?: string; text?: string };
      };
      if (event.event === "message-start") {
        state.role = typeof event.role === "string" ? event.role : "ai";
      }
      if (
        event.event === "content-block-delta" &&
        state.role === "ai" &&
        event.delta?.type === "text-delta" &&
        typeof event.delta.text === "string"
      ) {
        return event.delta.text;
      }
      return "";
    }
    if ("content" in value) {
      const message = value as {
        content: unknown;
        type?: string;
      };
      if (
        message.type === "tool" ||
        message.type === "human" ||
        message.type === "system"
      ) {
        return "";
      }
      const content = message.content;
      if (typeof content === "string") return content;
      if (Array.isArray(content)) {
        return content
          .filter(
            (block): block is { type: string; text: string } =>
              !!block &&
              typeof block === "object" &&
              (block as { type?: unknown }).type === "text"
          )
          .map((block) => block.text)
          .join("");
      }
    }
  }
  return "";
}

const app = new Hono<{ Bindings: Env }>();

// Storage failures must never break the chat, so inserts are fire-and-forget
// via waitUntil and only log.
async function recordMessage(
  env: Env,
  sessionId: string,
  role: "user" | "assistant",
  text: string
): Promise<void> {
  try {
    await env.DB.prepare(
      "INSERT INTO chat_messages (session_id, role, text) VALUES (?, ?, ?)"
    )
      .bind(sessionId, role, text)
      .run();
  } catch (error) {
    console.error("failed to persist chat message:", error);
  }
}

app.post("/api/chat", async (c) => {
  const body = await c.req.json< { messages?: unknown[] } >().catch(() => null);
  const messages = (body?.messages ?? []).filter(isChatMessage);

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return c.json(
      { error: "messages array ending with a user message is required" },
      400
    );
  }

  if (!c.env.ANTHROPIC_API_KEY) {
    return c.json({ error: "ANTHROPIC_API_KEY is not configured" }, 500);
  }

  // The client resends the whole thread every turn, so only the trailing user
  // message is persisted - exactly once per turn. A uuid cookie groups turns
  // from the same browser into one conversation without client changes.
  const cookieSid = getCookie(c, SESSION_COOKIE);
  const sessionId = UUID_RE.test(cookieSid ?? "") ? cookieSid! : crypto.randomUUID();

  c.executionCtx.waitUntil(
    recordMessage(c.env, sessionId, "user", messages[messages.length - 1].text)
  );

  const agent = createAgent(c.env);
  const stream = new ReadableStream({
    async start(controller) {
      let producedText = false;
      let assistantText = "";
      const roleState: StreamRoleState = { role: "ai" };
      const send = (delta: string) => {
        if (delta) {
          assistantText += delta;
          controller.enqueue(sseChunk(delta));
        }
      };
      try {
        const events = await agent.stream(
          { messages: toLangChainMessages(messages) },
          { streamMode: "messages", recursionLimit: 10 }
        );
        for await (const chunk of events) {
          const delta = extractTextDelta(chunk, roleState);
          if (delta) {
            producedText = true;
            send(delta);
          }
        }
        if (!producedText) {
          send("I apologize, but I couldn't process your question. Please try rephrasing it.");
        }
      } catch (error) {
        console.error("chat stream failed:", error);
        send(APOLOGY);
      } finally {
        if (assistantText.trim()) {
          c.executionCtx.waitUntil(recordMessage(c.env, sessionId, "assistant", assistantText));
        }
        controller.close();
      }
    },
  });

  const headers = new Headers({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
  });
  if (sessionId !== cookieSid) {
    headers.append(
      "Set-Cookie",
      `${SESSION_COOKIE}=${sessionId}; Path=/; Max-Age=${SESSION_COOKIE_MAX_AGE}; HttpOnly; SameSite=Lax`
    );
  }

  return new Response(stream, { headers });
});

export default app;
