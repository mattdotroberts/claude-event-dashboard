import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  attendees: defineTable({
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
  }),

  topics: defineTable({
    text: v.string(),
    emoji: v.optional(v.string()),
    isPreSeeded: v.boolean(),
    proposedBy: v.optional(v.id("attendees")),
    createdAt: v.number(),
    approved: v.optional(v.boolean()),
  }),

  topicVotes: defineTable({
    topicId: v.id("topics"),
    attendeeId: v.id("attendees"),
  })
    .index("by_topic", ["topicId"])
    .index("by_attendee", ["attendeeId"])
    .index("by_topic_and_attendee", ["topicId", "attendeeId"]),
});
