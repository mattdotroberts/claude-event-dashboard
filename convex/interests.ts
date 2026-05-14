"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import Anthropic from "@anthropic-ai/sdk";

const SEED_BUCKETS = [
  "Agents",
  "Evals",
  "MCP",
  "Claude Code",
  "Voice",
  "Shipping",
  "Design",
  "Regulation",
  "Hiring",
  "Funding",
  "Vibes",
];

const SYSTEM_PROMPT = `You classify event attendees' interests into ONE short bucket label for a live word cloud.

Seed buckets (prefer these when they fit):
${SEED_BUCKETS.map((b) => `- ${b}`).join("\n")}

Rules:
- Reply with ONLY the label. No quotes, no punctuation, no explanation.
- Prefer 1-2 words, Title Case.
- If nothing from the seed list fits naturally, invent a short 1-2 word label that captures the theme.
- Be generous with grouping. "agents in production" -> Agents. "MCP servers" -> MCP. "shipping fast" -> Shipping.`;

export const classifyAndStore = internalAction({
  args: { attendeeId: v.id("attendees") },
  handler: async (ctx, args): Promise<void> => {
    const interest: string | null = await ctx.runMutation(
      internal.attendees._getInterestForClassification,
      { id: args.attendeeId }
    );
    if (!interest || interest.trim().length === 0) return;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error("ANTHROPIC_API_KEY not set on Convex deployment");
      return;
    }

    const client = new Anthropic({ apiKey });

    try {
      const msg = await client.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 16,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: interest.slice(0, 280) }],
      });
      const text = msg.content
        .filter((b) => b.type === "text")
        .map((b) => (b.type === "text" ? b.text : ""))
        .join("")
        .trim()
        .replace(/^["']|["']$/g, "") // strip wrapping quotes if any
        .slice(0, 32);
      if (text.length === 0) return;
      await ctx.runMutation(internal.attendees._setInterestBucket, {
        id: args.attendeeId,
        bucket: text,
      });
    } catch (err) {
      console.error("classifyAndStore failed", err);
    }
  },
});
