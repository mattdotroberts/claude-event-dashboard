import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const SEED_TOPICS = [
  { emoji: "🏢", text: "AI for non-tech teams" },
  { emoji: "⚖️", text: "EU AI regulation" },
  { emoji: "💰", text: "AI business models" },
  { emoji: "🔧", text: "MCP + tool use" },
  { emoji: "🏛️", text: "Change management & governance for AI in the enterprise" },
  { emoji: "⚖️", text: "AI & ethics" },
];

export const seedTopics = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("topics").collect();
    if (existing.length > 0) return;

    for (const topic of SEED_TOPICS) {
      await ctx.db.insert("topics", {
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
    const topicId = await ctx.db.insert("topics", {
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

    await ctx.db.insert("topicVotes", {
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

// Returns approved topics (for dashboard and voting)
export const getTopicsWithVotes = query({
  args: {},
  handler: async (ctx) => {
    const topics = await ctx.db.query("topics").collect();
    const allVotes = await ctx.db.query("topicVotes").collect();

    const voteCounts = new Map<string, number>();
    for (const vote of allVotes) {
      voteCounts.set(
        vote.topicId,
        (voteCounts.get(vote.topicId) ?? 0) + 1
      );
    }

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

// Returns ALL topics including pending (for admin + mobile proposer view)
export const getAllTopicsWithVotes = query({
  args: {},
  handler: async (ctx) => {
    const topics = await ctx.db.query("topics").collect();
    const allVotes = await ctx.db.query("topicVotes").collect();

    const voteCounts = new Map<string, number>();
    for (const vote of allVotes) {
      voteCounts.set(
        vote.topicId,
        (voteCounts.get(vote.topicId) ?? 0) + 1
      );
    }

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
    return await ctx.db.insert("topics", {
      text: args.text,
      emoji: args.emoji,
      isPreSeeded: true,
      createdAt: Date.now(),
      approved: true,
    });
  },
});

export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const topics = await ctx.db.query("topics").collect();
    for (const t of topics) {
      await ctx.db.delete(t._id);
    }
    const votes = await ctx.db.query("topicVotes").collect();
    for (const v of votes) {
      await ctx.db.delete(v._id);
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
