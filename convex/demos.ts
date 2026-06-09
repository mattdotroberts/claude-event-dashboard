import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { resolveEvent, requireEvent } from "./events";

const MAX_VOTES_PER_DEVICE = 3;

/**
 * Submit a demo to the active event's directory. Appears immediately
 * (auto-moderation: admin can hide later). Kicks off a background action to
 * fetch + store the project's OG image and title.
 */
export const submitDemo = mutation({
  args: {
    builderName: v.string(),
    email: v.string(),
    linkedinUrl: v.optional(v.string()),
    projectName: v.string(),
    tagline: v.optional(v.string()),
    projectUrl: v.string(),
    // Optional avatar already uploaded via generateUploadUrl
    avatarStorageId: v.optional(v.id("_storage")),
    // Optional manually-uploaded cover image (used if OG fetch finds nothing)
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const event = await requireEvent(ctx);
    const id = await ctx.db.insert("demos", {
      eventId: event._id,
      builderName: args.builderName,
      email: args.email,
      linkedinUrl: args.linkedinUrl,
      avatarStorageId: args.avatarStorageId,
      projectName: args.projectName,
      tagline: args.tagline,
      projectUrl: args.projectUrl,
      imageStorageId: args.imageStorageId,
      hidden: false,
      createdAt: Date.now(),
    });
    // Only auto-fetch OG if the submitter didn't already upload a cover.
    if (!args.imageStorageId && args.projectUrl.trim().length > 0) {
      await ctx.scheduler.runAfter(0, internal.demoOg.fetchAndStore, { demoId: id });
    }
    return id;
  },
});

// Internal helpers for the OG action
export const _getDemoUrl = internalMutation({
  args: { demoId: v.id("demos") },
  handler: async (ctx, args) => {
    const d = await ctx.db.get(args.demoId);
    return d ? { projectUrl: d.projectUrl, hasImage: !!d.imageStorageId } : null;
  },
});

export const _setDemoOg = internalMutation({
  args: {
    demoId: v.id("demos"),
    imageStorageId: v.optional(v.id("_storage")),
    faviconStorageId: v.optional(v.id("_storage")),
    ogTitle: v.optional(v.string()),
    ogDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = {};
    if (args.imageStorageId) patch.imageStorageId = args.imageStorageId;
    if (args.faviconStorageId) patch.faviconStorageId = args.faviconStorageId;
    if (args.ogTitle) patch.ogTitle = args.ogTitle;
    if (args.ogDescription) patch.ogDescription = args.ogDescription;
    if (Object.keys(patch).length > 0) await ctx.db.patch(args.demoId, patch);
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => await ctx.storage.generateUploadUrl(),
});

/**
 * Public directory for the active (or given) event. Returns vote counts and
 * resolved image/avatar URLs. NEVER returns email (admin-only).
 * If `deviceId` is given, also returns which demoIds that device has voted for
 * and how many votes it has left.
 */
export const getDemos = query({
  args: { slug: v.optional(v.string()), deviceId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const event = await resolveEvent(ctx, args.slug);
    if (!event) return { demos: [], myVotes: [], votesLeft: MAX_VOTES_PER_DEVICE };

    const demos = await ctx.db
      .query("demos")
      .withIndex("by_event", (q) => q.eq("eventId", event._id))
      .collect();
    const allVotes = await ctx.db
      .query("demoVotes")
      .withIndex("by_event_and_device", (q) => q.eq("eventId", event._id))
      .collect();

    const voteCounts = new Map<string, number>();
    for (const vrow of allVotes) {
      voteCounts.set(vrow.demoId, (voteCounts.get(vrow.demoId) ?? 0) + 1);
    }

    const myVoteRows = args.deviceId
      ? allVotes.filter((vrow) => vrow.deviceId === args.deviceId)
      : [];
    const myVotes = myVoteRows.map((vrow) => vrow.demoId);

    const visible = demos.filter((d) => !d.hidden);
    const withMeta = await Promise.all(
      visible.map(async (d) => {
        const imageUrl = d.imageStorageId
          ? await ctx.storage.getUrl(d.imageStorageId)
          : null;
        const avatarUrl = d.avatarStorageId
          ? await ctx.storage.getUrl(d.avatarStorageId)
          : null;
        const faviconUrl = d.faviconStorageId
          ? await ctx.storage.getUrl(d.faviconStorageId)
          : null;
        // email intentionally omitted from the public shape
        return {
          _id: d._id,
          builderName: d.builderName,
          linkedinUrl: d.linkedinUrl ?? null,
          projectName: d.projectName,
          tagline: d.tagline ?? null,
          projectUrl: d.projectUrl,
          ogTitle: d.ogTitle ?? null,
          ogDescription: d.ogDescription ?? null,
          imageUrl,
          avatarUrl,
          faviconUrl,
          voteCount: voteCounts.get(d._id) ?? 0,
          createdAt: d.createdAt,
        };
      })
    );

    // Return in stable creation order; the client decides random vs. most-votes
    // so it can shuffle per-session without the server reordering on each vote.
    withMeta.sort((a, b) => a.createdAt - b.createdAt);
    return {
      demos: withMeta,
      myVotes,
      votesLeft: Math.max(0, MAX_VOTES_PER_DEVICE - myVotes.length),
    };
  },
});

/** Admin view — includes hidden demos + email, for moderation/prize contact. */
export const getDemosAdmin = query({
  args: { slug: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const event = await resolveEvent(ctx, args.slug);
    if (!event) return [];
    const demos = await ctx.db
      .query("demos")
      .withIndex("by_event", (q) => q.eq("eventId", event._id))
      .collect();
    const allVotes = await ctx.db
      .query("demoVotes")
      .withIndex("by_event_and_device", (q) => q.eq("eventId", event._id))
      .collect();
    const voteCounts = new Map<string, number>();
    for (const vrow of allVotes) {
      voteCounts.set(vrow.demoId, (voteCounts.get(vrow.demoId) ?? 0) + 1);
    }
    return demos
      .map((d) => ({ ...d, voteCount: voteCounts.get(d._id) ?? 0 }))
      .sort((a, b) => b.voteCount - a.voteCount);
  },
});

export const voteDemo = mutation({
  args: { demoId: v.id("demos"), deviceId: v.string() },
  handler: async (ctx, args) => {
    const event = await requireEvent(ctx);

    // Already voted for this demo? no-op.
    const existing = await ctx.db
      .query("demoVotes")
      .withIndex("by_demo_and_device", (q) =>
        q.eq("demoId", args.demoId).eq("deviceId", args.deviceId)
      )
      .first();
    if (existing) return;

    // Enforce 3-per-device within this event.
    const myVotes = await ctx.db
      .query("demoVotes")
      .withIndex("by_event_and_device", (q) =>
        q.eq("eventId", event._id).eq("deviceId", args.deviceId)
      )
      .collect();
    if (myVotes.length >= MAX_VOTES_PER_DEVICE) {
      throw new Error(`Maximum ${MAX_VOTES_PER_DEVICE} votes allowed`);
    }

    await ctx.db.insert("demoVotes", {
      eventId: event._id,
      demoId: args.demoId,
      deviceId: args.deviceId,
    });
  },
});

export const unvoteDemo = mutation({
  args: { demoId: v.id("demos"), deviceId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("demoVotes")
      .withIndex("by_demo_and_device", (q) =>
        q.eq("demoId", args.demoId).eq("deviceId", args.deviceId)
      )
      .first();
    if (existing) await ctx.db.delete(existing._id);
  },
});

// Admin: re-run the OG/icon fetch for a demo (clears any stored image first).
export const refetchOg = mutation({
  args: { demoId: v.id("demos") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.demoId, { imageStorageId: undefined });
    await ctx.scheduler.runAfter(0, internal.demoOg.fetchAndStore, {
      demoId: args.demoId,
    });
  },
});

export const setHidden = mutation({
  args: { demoId: v.id("demos"), hidden: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.demoId, { hidden: args.hidden });
  },
});

export const deleteDemo = mutation({
  args: { demoId: v.id("demos") },
  handler: async (ctx, args) => {
    const votes = await ctx.db
      .query("demoVotes")
      .withIndex("by_demo", (q) => q.eq("demoId", args.demoId))
      .collect();
    for (const vrow of votes) await ctx.db.delete(vrow._id);
    await ctx.db.delete(args.demoId);
  },
});
