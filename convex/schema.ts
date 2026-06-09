import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Thin event identity table. Content (name, speakers, agenda, seed topics)
  // lives in code config under src/data/events/<slug>.ts — keyed by `slug`.
  // The DB only tracks which event is active and which are archived, and acts
  // as the parent for all per-event data via `eventId`.
  events: defineTable({
    slug: v.string(),
    name: v.string(),
    date: v.string(),
    isActive: v.boolean(),
    isArchived: v.boolean(),
    createdAt: v.number(),
  }).index("by_slug", ["slug"]),

  attendees: defineTable({
    // Backfilled for all pre-existing rows by events:backfillInitialEvent, then
    // made required. Every attendee belongs to exactly one event.
    eventId: v.id("events"),
    name: v.string(),
    role: v.string(),
    // New simplified field
    interest: v.optional(v.string()),
    interestBucket: v.optional(v.string()),
    photoStorageId: v.optional(v.id("_storage")),
    // Legacy fields — now optional so old + new flows coexist
    experienceLevel: v.optional(
      v.union(v.literal("curious"), v.literal("daily"), v.literal("builder"))
    ),
    location: v.optional(
      v.union(
        v.literal("local"),
        v.literal("visiting"),
        v.literal("temporary"),
        v.literal("considering")
      )
    ),
    spicyTake1: v.optional(
      v.union(v.literal("agree"), v.literal("disagree"), v.literal("drink"))
    ),
    spicyTake2: v.optional(
      v.union(v.literal("obviously"), v.literal("depends"), v.literal("brave"))
    ),
    offer: v.optional(v.string()),
    need: v.optional(v.string()),
    confession: v.optional(v.string()),
  }).index("by_event", ["eventId"]),

  topics: defineTable({
    eventId: v.id("events"),
    text: v.string(),
    emoji: v.optional(v.string()),
    isPreSeeded: v.boolean(),
    proposedBy: v.optional(v.id("attendees")),
    createdAt: v.number(),
    approved: v.optional(v.boolean()),
  }).index("by_event", ["eventId"]),

  topicVotes: defineTable({
    eventId: v.id("events"),
    topicId: v.id("topics"),
    attendeeId: v.id("attendees"),
  })
    .index("by_topic", ["topicId"])
    .index("by_attendee", ["attendeeId"])
    .index("by_topic_and_attendee", ["topicId", "attendeeId"])
    .index("by_event", ["eventId"]),

  // Demo directory — attendee projects shown at the event, voted on by the room.
  demos: defineTable({
    eventId: v.id("events"),
    // Builder (public)
    builderName: v.string(),
    linkedinUrl: v.optional(v.string()),
    avatarStorageId: v.optional(v.id("_storage")),
    // Builder (admin-only — never returned to the public directory query)
    email: v.string(),
    // Project
    projectName: v.string(),
    tagline: v.optional(v.string()),
    projectUrl: v.string(),
    // Card hero: stored og:image OR uploaded cover. Falls back to a generated
    // gradient (using projectName/ogTitle) when neither is present.
    imageStorageId: v.optional(v.id("_storage")),
    // Small site favicon shown next to the project name on every card.
    faviconStorageId: v.optional(v.id("_storage")),
    ogTitle: v.optional(v.string()),
    ogDescription: v.optional(v.string()),
    hidden: v.boolean(),
    createdAt: v.number(),
  }).index("by_event", ["eventId"]),

  // One row per (device, demo). Each device gets up to 3 demo votes per event.
  demoVotes: defineTable({
    eventId: v.id("events"),
    demoId: v.id("demos"),
    deviceId: v.string(),
  })
    .index("by_demo", ["demoId"])
    .index("by_device", ["deviceId"])
    .index("by_demo_and_device", ["demoId", "deviceId"])
    .index("by_event_and_device", ["eventId", "deviceId"]),
});
