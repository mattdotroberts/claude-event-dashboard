import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import type { QueryCtx, MutationCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

/**
 * Resolve the event a request is scoped to.
 *  - If `slug` is given, return that specific event (used by /prev/<slug> archive views).
 *  - Otherwise return the active event.
 * Returns null if nothing matches (e.g. fresh deployment before any event exists).
 *
 * This is the single source of truth for "which event" — the frontend never
 * passes eventId for the active event; the server figures it out here.
 */
export async function resolveEvent(
  ctx: QueryCtx | MutationCtx,
  slug?: string
): Promise<Doc<"events"> | null> {
  if (slug) {
    return await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
  }
  const active = await ctx.db
    .query("events")
    .filter((q) => q.eq(q.field("isActive"), true))
    .first();
  return active;
}

/**
 * Like resolveEvent but throws if none is found. Use in write paths that must
 * stamp an eventId (submit attendee, propose topic, vote, submit demo).
 */
export async function requireEvent(
  ctx: QueryCtx | MutationCtx,
  slug?: string
): Promise<Doc<"events">> {
  const event = await resolveEvent(ctx, slug);
  if (!event) {
    throw new Error(
      "No active event. An admin must create one before attendees can join."
    );
  }
  return event;
}

export const getActive = query({
  args: {},
  handler: async (ctx) => {
    return await resolveEvent(ctx);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await resolveEvent(ctx, args.slug);
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db.query("events").collect();
    // Active first, then most-recent archived
    return events.sort((a, b) => {
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      return b.createdAt - a.createdAt;
    });
  },
});

/**
 * Create an event. If `makeActive`, demote any current active event first
 * (without archiving it — use startNextEvent for the archive flow).
 */
export const createEvent = mutation({
  args: {
    slug: v.string(),
    name: v.string(),
    date: v.string(),
    makeActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (existing) throw new Error(`Event with slug "${args.slug}" already exists`);

    if (args.makeActive) {
      const current = await ctx.db
        .query("events")
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
      for (const e of current) await ctx.db.patch(e._id, { isActive: false });
    }

    return await ctx.db.insert("events", {
      slug: args.slug,
      name: args.name,
      date: args.date,
      isActive: args.makeActive ?? false,
      isArchived: false,
      createdAt: Date.now(),
    });
  },
});

/**
 * The "Start next event" admin action.
 * 1. Archive the current active event (isActive=false, isArchived=true) so its
 *    dashboard becomes the read-only /prev/<slug> history. Its data is untouched.
 * 2. Create a fresh, empty active event. No attendees/topics/votes/demos carry
 *    over — only the app structure (code) is shared. Content for the new event
 *    comes from its code config at src/data/events/<slug>.ts.
 */
export const startNextEvent = mutation({
  args: {
    slug: v.string(),
    name: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const dupe = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (dupe) throw new Error(`Event with slug "${args.slug}" already exists`);

    const current = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    for (const e of current) {
      await ctx.db.patch(e._id, { isActive: false, isArchived: true });
    }

    return await ctx.db.insert("events", {
      slug: args.slug,
      name: args.name,
      date: args.date,
      isActive: true,
      isArchived: false,
      createdAt: Date.now(),
    });
  },
});

/** Mark an event archived (read-only /prev view). Used for one-off setup. */
export const setArchived = mutation({
  args: { slug: v.string(), isArchived: v.boolean() },
  handler: async (ctx, args) => {
    const e = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (!e) throw new Error(`No event with slug "${args.slug}"`);
    await ctx.db.patch(e._id, { isArchived: args.isArchived, isActive: false });
  },
});

/**
 * One-off migration: create the initial "builders-3" event and tag every
 * pre-existing attendee/topic/topicVote with its eventId. Idempotent — safe to
 * run more than once. Returns counts so we can verify nothing was missed.
 */
export const backfillInitialEvent = internalMutation({
  args: { slug: v.string(), name: v.string(), date: v.string() },
  handler: async (ctx, args) => {
    let event = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (!event) {
      const id = await ctx.db.insert("events", {
        slug: args.slug,
        name: args.name,
        date: args.date,
        isActive: true,
        isArchived: false,
        createdAt: Date.now(),
      });
      event = await ctx.db.get(id);
    }
    const eventId = event!._id as Id<"events">;

    let attendees = 0;
    for (const a of await ctx.db.query("attendees").collect()) {
      if (!a.eventId) {
        await ctx.db.patch(a._id, { eventId });
        attendees++;
      }
    }
    let topics = 0;
    for (const t of await ctx.db.query("topics").collect()) {
      if (!t.eventId) {
        await ctx.db.patch(t._id, { eventId });
        topics++;
      }
    }
    let votes = 0;
    for (const vrow of await ctx.db.query("topicVotes").collect()) {
      if (!vrow.eventId) {
        await ctx.db.patch(vrow._id, { eventId });
        votes++;
      }
    }
    return { eventId, taggedAttendees: attendees, taggedTopics: topics, taggedVotes: votes };
  },
});

/**
 * Verification query for the migration: how many rows still lack an eventId.
 * Must return all-zero before we can safely tighten eventId to required.
 */
export const migrationStatus = query({
  args: {},
  handler: async (ctx) => {
    const attendees = await ctx.db.query("attendees").collect();
    const topics = await ctx.db.query("topics").collect();
    const votes = await ctx.db.query("topicVotes").collect();
    return {
      attendeesMissing: attendees.filter((a) => !a.eventId).length,
      topicsMissing: topics.filter((t) => !t.eventId).length,
      votesMissing: votes.filter((v) => !v.eventId).length,
      attendeesTotal: attendees.length,
      topicsTotal: topics.length,
      votesTotal: votes.length,
    };
  },
});
