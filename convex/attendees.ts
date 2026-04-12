import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const submitAttendee = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    experienceLevel: v.union(
      v.literal("curious"),
      v.literal("daily"),
      v.literal("builder")
    ),
    location: v.union(
      v.literal("local"),
      v.literal("visiting"),
      v.literal("temporary"),
      v.literal("considering")
    ),
    spicyTake1: v.union(
      v.literal("agree"),
      v.literal("disagree"),
      v.literal("drink")
    ),
    spicyTake2: v.union(
      v.literal("obviously"),
      v.literal("depends"),
      v.literal("brave")
    ),
    offer: v.string(),
    need: v.string(),
    confession: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("attendees", args);
    return id;
  },
});

export const updateAttendee = mutation({
  args: {
    id: v.id("attendees"),
    offer: v.optional(v.string()),
    need: v.optional(v.string()),
    confession: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const updates: Record<string, string> = {};
    if (fields.offer !== undefined) updates.offer = fields.offer;
    if (fields.need !== undefined) updates.need = fields.need;
    if (fields.confession !== undefined) updates.confession = fields.confession;
    await ctx.db.patch(id, updates);
  },
});

export const getById = query({
  args: { id: v.id("attendees") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("attendees").collect();
  },
});

export const getCount = query({
  args: {},
  handler: async (ctx) => {
    const attendees = await ctx.db.query("attendees").collect();
    return attendees.length;
  },
});

export const deleteAttendee = mutation({
  args: { id: v.id("attendees") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const attendees = await ctx.db.query("attendees").collect();
    for (const a of attendees) {
      await ctx.db.delete(a._id);
    }
  },
});

export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const attendees = await ctx.db.query("attendees").order("desc").take(limit);
    return attendees;
  },
});
