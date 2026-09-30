import { tool } from "@langchain/core/tools";
import { z } from "zod";
import faqText from "../data/recruiter-faq.txt";

export const loadFaq = tool(
  async () => faqText,
  {
    name: "load_faq",
    description:
      "Returns Olek Dmytrenko's recruiter FAQ knowledge base: standardized answers to the screening " +
      "questions recruiters ask most (salary expectations, notice period, location and timezone, English level, " +
      "contract format, years of Python/GenAI experience, agentic AI and RAG background, AI coding tools, AWS, " +
      "databases, frontend, presales). " +
      "Call this for any compensation, availability, logistics or screening question.",
    schema: z.object({}),
  }
);
