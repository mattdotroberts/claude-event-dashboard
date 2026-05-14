import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const submitAttendee = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    interest: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("attendees", {
      name: args.name,
      role: args.role,
      interest: args.interest,
    });
    if (args.interest && args.interest.trim().length > 0) {
      await ctx.scheduler.runAfter(0, internal.interests.classifyAndStore, { attendeeId: id });
    }
    return id;
  },
});

export const updateAttendeeInterest = mutation({
  args: {
    id: v.id("attendees"),
    interest: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { interest: args.interest });
    if (args.interest.trim().length > 0) {
      await ctx.scheduler.runAfter(0, internal.interests.classifyAndStore, { attendeeId: args.id });
    } else {
      // Cleared interest — clear bucket too
      await ctx.db.patch(args.id, { interestBucket: undefined });
    }
  },
});

export const updateAttendeeAsAdmin = mutation({
  args: {
    id: v.id("attendees"),
    name: v.optional(v.string()),
    role: v.optional(v.string()),
    interest: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...patch } = args;
    const updates: Record<string, string> = {};
    if (patch.name !== undefined) updates.name = patch.name;
    if (patch.role !== undefined) updates.role = patch.role;
    let interestChanged = false;
    if (patch.interest !== undefined) {
      updates.interest = patch.interest;
      interestChanged = true;
    }
    await ctx.db.patch(id, updates);
    if (interestChanged) {
      if (patch.interest && patch.interest.trim().length > 0) {
        await ctx.scheduler.runAfter(0, internal.interests.classifyAndStore, { attendeeId: id });
      } else {
        await ctx.db.patch(id, { interestBucket: undefined });
      }
    }
  },
});

// Internal helpers used by the classify action
export const _getInterestForClassification = internalMutation({
  args: { id: v.id("attendees") },
  handler: async (ctx, args) => {
    const a = await ctx.db.get(args.id);
    return a?.interest ?? null;
  },
});

export const _setInterestBucket = internalMutation({
  args: { id: v.id("attendees"), bucket: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { interestBucket: args.bucket });
  },
});

// Legacy update — keep so any in-flight clients don't 404
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
    const a = await ctx.db.get(args.id);
    if (!a) return null;
    const photoUrl = a.photoStorageId
      ? await ctx.storage.getUrl(a.photoStorageId)
      : null;
    return { ...a, photoUrl };
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const attendees = await ctx.db.query("attendees").collect();
    // Resolve photo URLs for any attendees that have a stored photo
    return await Promise.all(
      attendees.map(async (a) => {
        const photoUrl = a.photoStorageId
          ? await ctx.storage.getUrl(a.photoStorageId)
          : null;
        return { ...a, photoUrl };
      })
    );
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const setPhoto = mutation({
  args: {
    id: v.id("attendees"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    // If replacing an existing photo, delete the old blob
    const existing = await ctx.db.get(args.id);
    if (existing?.photoStorageId) {
      await ctx.storage.delete(existing.photoStorageId);
    }
    await ctx.db.patch(args.id, { photoStorageId: args.storageId });
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
