import { Hono } from "hono";
import { AIMessage, HumanMessage, type BaseMessageLike } from "@langchain/core/messages";
import { createAgent } from "./ai/agent";
import type { Env } from "./env";

const MAX_HISTORY_MESSAGES = 12;
const APOLOGY =
  "I apologize, but I encountered an error processing your question. Please try again later.";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
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

app.post("/api/chat", async (c) => {
  const body = await c.req.json< { messages?: ChatMessage[] } >().catch(() => null);
  const messages = (body?.messages ?? []).filter(
    (m) =>
      m &&
      (m.role === "user" || m.role === "assistant") &&
      typeof m.text === "string" &&
      m.text.trim().length > 0
  );

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return c.json(
      { error: "messages array ending with a user message is required" },
      400
    );
  }

  if (!c.env.ANTHROPIC_API_KEY) {
    return c.json({ error: "ANTHROPIC_API_KEY is not configured" }, 500);
  }

  const agent = createAgent(c.env);
  const stream = new ReadableStream({
    async start(controller) {
      let producedText = false;
      const roleState: StreamRoleState = { role: "ai" };
      const send = (delta: string) => {
        if (delta) controller.enqueue(sseChunk(delta));
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
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });
});

export default app;
