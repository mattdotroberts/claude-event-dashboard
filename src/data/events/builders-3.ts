import type { EventConfig } from "./types";
import { SPEAKERS } from "../speakers";

/**
 * The previous event — "Claude Code for Builders #3", Barcelona, 14 May 2026.
 * Kept as the archive config so /prev/14052026-builders-3 renders correctly.
 */
export const buildersThree: EventConfig = {
  slug: "builders-3",
  title: "Claude Code for Builders",
  edition: "Barcelona #3",
  date: "14 May 2026",
  hostedBy: "Hosted by AI Summit Barcelona, WTC Barcelona & Happy Operators",
  logos: [
    { src: "/logo-claude.svg", name: "", url: "https://claude.ai", className: "header-logo--claude" },
    { src: "/logo-aisummit-full.svg", name: "", url: "https://aisummitbarcelona.com", className: "header-logo--aisummit" },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/c/c4/WTCB_Logo.svg",
      name: "WTC Barcelona",
      url: "https://www.wtcbarcelona.com",
      className: "header-logo--wtcb",
    },
    { src: "/logo-happy-operators.png", name: "Happy Operators", url: "https://www.happyoperators.com/community", className: "header-logo--hapi" },
  ],
  seedTopics: [
    { emoji: "🏢", text: "AI for non-tech teams" },
    { emoji: "⚖️", text: "EU AI regulation" },
    { emoji: "💰", text: "AI business models" },
    { emoji: "🔧", text: "MCP + tool use" },
    { emoji: "🏛️", text: "Change management & governance for AI in the enterprise" },
    { emoji: "⚖️", text: "AI & ethics" },
  ],
  interestSuggestions: [
    "Agents in production",
    "Evals",
    "MCP",
    "Claude Code",
    "Voice",
    "Shipping faster",
    "Design with AI",
    "Managed Agents",
    "Regulation",
  ],
  targetAttendees: 200,
  demosEnabled: false,
  tonightSlides: [
    { kind: 'title' },
    {
      kind: 'agenda',
      title: 'Agenda',
      items: [
        { time: '6.20pm', label: 'Opening Remarks' },
        { time: '6.25pm', label: 'AI Summit giveaway 🎁' },
        { time: '6.30pm', label: 'Community Talks' },
        { time: '7.50pm', label: 'Anthropic giveaway 🎁' },
        { time: '7.55pm', label: 'Next event preview 📣' },
        { time: '8.00pm', label: 'Cheese, Wine and Razzamatazzing' },
      ],
    },
    {
      kind: 'people',
      tag: 'Speakers',
      title: 'Speakers',
      people: SPEAKERS.map((s) => ({ name: s.name, role: s.position, photo: s.photo })),
    },
    {
      kind: 'saveTheDate',
      date: 'June 10th',
      title: 'Claude for Creativity',
      subtitle: 'A design-focused community meetup',
    },
  ],
  speakers: SPEAKERS,
};
