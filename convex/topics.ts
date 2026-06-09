import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import type { Id, Doc } from "./_generated/dataModel";
import { resolveEvent, requireEvent } from "./events";

/**
 * Topics for a given event. Pre-migration rows without eventId fall back to the
 * whole table so a fresh deployment still renders.
 */
async function eventTopics(
  ctx: QueryCtx,
  eventId: Id<"events"> | undefined
): Promise<Doc<"topics">[]> {
  if (!eventId) return await ctx.db.query("topics").collect();
  return await ctx.db
    .query("topics")
    .withIndex("by_event", (q) => q.eq("eventId", eventId))
    .collect();
}

// Seed topics are passed in from the active event's code config
// (src/data/events/<slug>.ts) — they differ per event. Seeds only once per event.
export const seedTopics = mutation({
  args: {
    topics: v.optional(
      v.array(v.object({ text: v.string(), emoji: v.optional(v.string()) }))
    ),
  },
  handler: async (ctx, args) => {
    const event = await requireEvent(ctx);
    const existing = await eventTopics(ctx, event._id);
    if (existing.length > 0) return;

    const seeds = args.topics ?? [];
    for (const topic of seeds) {
      await ctx.db.insert("topics", {
        eventId: event._id,
        text: topic.text,
        emoji: topic.emoji,
        isPreSeeded: true,
        createdAt: Date.now(),
        approved: true,
      });
    }
  },
});

export const proposeTopic = mutation({
  args: {
    text: v.string(),
    attendeeId: v.id("attendees"),
  },
  handler: async (ctx, args) => {
    const event = await requireEvent(ctx);
    const topicId = await ctx.db.insert("topics", {
      eventId: event._id,
      text: args.text,
      isPreSeeded: false,
      proposedBy: args.attendeeId,
      createdAt: Date.now(),
      approved: false, // needs admin approval
    });

    // Auto-vote for the proposer
    const existingVotes = await ctx.db
      .query("topicVotes")
      .withIndex("by_attendee", (q) => q.eq("attendeeId", args.attendeeId))
      .collect();

    if (existingVotes.length < 2) {
      await ctx.db.insert("topicVotes", {
        eventId: event._id,
        topicId,
        attendeeId: args.attendeeId,
      });
    }

    return topicId;
  },
});

export const approveTopic = mutation({
  args: { topicId: v.id("topics") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.topicId, { approved: true });
  },
});

export const rejectTopic = mutation({
  args: { topicId: v.id("topics") },
  handler: async (ctx, args) => {
    // Delete all votes for this topic first
    const votes = await ctx.db
      .query("topicVotes")
      .withIndex("by_topic", (q) => q.eq("topicId", args.topicId))
      .collect();
    for (const vote of votes) {
      await ctx.db.delete(vote._id);
    }
    await ctx.db.delete(args.topicId);
  },
});

export const vote = mutation({
  args: {
    topicId: v.id("topics"),
    attendeeId: v.id("attendees"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("topicVotes")
      .withIndex("by_topic_and_attendee", (q) =>
        q.eq("topicId", args.topicId).eq("attendeeId", args.attendeeId)
      )
      .first();
    if (existing) return;

    const allVotes = await ctx.db
      .query("topicVotes")
      .withIndex("by_attendee", (q) => q.eq("attendeeId", args.attendeeId))
      .collect();
    if (allVotes.length >= 2) {
      throw new Error("Maximum 2 votes allowed");
    }

    const event = await requireEvent(ctx);
    await ctx.db.insert("topicVotes", {
      eventId: event._id,
      topicId: args.topicId,
      attendeeId: args.attendeeId,
    });
  },
});

export const unvote = mutation({
  args: {
    topicId: v.id("topics"),
    attendeeId: v.id("attendees"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("topicVotes")
      .withIndex("by_topic_and_attendee", (q) =>
        q.eq("topicId", args.topicId).eq("attendeeId", args.attendeeId)
      )
      .first();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

// Vote counts keyed by topicId, for a given set of topics.
function countVotes(
  topics: Doc<"topics">[],
  allVotes: Doc<"topicVotes">[]
): Map<string, number> {
  const topicIds = new Set(topics.map((t) => t._id as string));
  const counts = new Map<string, number>();
  for (const vote of allVotes) {
    if (!topicIds.has(vote.topicId as string)) continue;
    counts.set(vote.topicId, (counts.get(vote.topicId) ?? 0) + 1);
  }
  return counts;
}

// Returns approved topics for the active (or given) event — dashboard + voting.
export const getTopicsWithVotes = query({
  args: { slug: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const event = await resolveEvent(ctx, args.slug);
    const topics = await eventTopics(ctx, event?._id);
    const allVotes = await ctx.db.query("topicVotes").collect();
    const voteCounts = countVotes(topics, allVotes);

    const topicsWithVotes = topics
      .filter((t) => t.approved !== false) // treat missing approved as true (backward compat)
      .map((topic) => ({
        ...topic,
        voteCount: voteCounts.get(topic._id) ?? 0,
      }));

    topicsWithVotes.sort((a, b) => b.voteCount - a.voteCount);
    return topicsWithVotes;
  },
});

// Returns ALL topics including pending for the active event (admin + proposer view).
export const getAllTopicsWithVotes = query({
  args: { slug: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const event = await resolveEvent(ctx, args.slug);
    const topics = await eventTopics(ctx, event?._id);
    const allVotes = await ctx.db.query("topicVotes").collect();
    const voteCounts = countVotes(topics, allVotes);

    const topicsWithVotes = topics.map((topic) => ({
      ...topic,
      voteCount: voteCounts.get(topic._id) ?? 0,
    }));

    topicsWithVotes.sort((a, b) => b.voteCount - a.voteCount);
    return topicsWithVotes;
  },
});

export const addTopic = mutation({
  args: { text: v.string(), emoji: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const event = await requireEvent(ctx);
    return await ctx.db.insert("topics", {
      eventId: event._id,
      text: args.text,
      emoji: args.emoji,
      isPreSeeded: true,
      createdAt: Date.now(),
      approved: true,
    });
  },
});

// Clears topics + their votes for the ACTIVE event only — archives keep theirs.
export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const event = await resolveEvent(ctx);
    const topics = await eventTopics(ctx, event?._id);
    const topicIds = new Set(topics.map((t) => t._id as string));
    for (const t of topics) {
      await ctx.db.delete(t._id);
    }
    const votes = await ctx.db.query("topicVotes").collect();
    for (const vrow of votes) {
      if (topicIds.has(vrow.topicId as string)) {
        await ctx.db.delete(vrow._id);
      }
    }
  },
});

export const getVotesForAttendee = query({
  args: { attendeeId: v.id("attendees") },
  handler: async (ctx, args) => {
    const votes = await ctx.db
      .query("topicVotes")
      .withIndex("by_attendee", (q) => q.eq("attendeeId", args.attendeeId))
      .collect();
    return votes.map((v) => v.topicId);
  },
});

export const getAttendeesForTopic = query({
  args: { topicId: v.id("topics") },
  handler: async (ctx, args) => {
    const votes = await ctx.db
      .query("topicVotes")
      .withIndex("by_topic", (q) => q.eq("topicId", args.topicId))
      .collect();

    const attendees = await Promise.all(
      votes.map(async (vote) => {
        const attendee = await ctx.db.get(vote.attendeeId);
        return attendee
          ? { _id: attendee._id, name: attendee.name, role: attendee.role }
          : null;
      })
    );

    return attendees.filter(Boolean);
  },
});
