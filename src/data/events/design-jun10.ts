import type { EventConfig } from "./types";
import type { Speaker } from "../speakers";

/**
 * Speakers for the design event (talk + panel), with 3-bullet host notes.
 * These render on the host-notes /speakers page.
 */
const DESIGN_SPEAKERS: Speaker[] = [
  // ===== Talk: Your AI looks like everyone else's =====
  {
    name: "Laura Rosa Diaz Cañas",
    position: "Brand Strategist @ EDUCA EDTECH Group",
    photo: "/speakers/laurarosa.png",
    talkTitle: "Talk — Your AI looks like everyone else's",
    time: "18:40 (talk)",
    notes: [
      "Brand Strategist at EDUCA EDTECH Group.",
      "Co-presents the talk 'Your AI looks like everyone else's' with Iván González.",
      "Brings the brand + taste lens: how to keep a distinct identity when everyone uses the same AI tools.",
    ],
  },
  {
    name: "Iván González",
    position: "Principal Engineer @ Siemens Energy",
    photo: "/speakers/ivan.png",
    talkTitle: "Talk — Your AI looks like everyone else's",
    time: "18:40 (talk)",
    notes: [
      "Principal Engineer at Siemens Energy (Barcelona).",
      "Co-presents 'Your AI looks like everyone else's' with Laura Rosa Diaz Cañas.",
      "Brings the engineering lens: building with AI without producing generic, samey output.",
    ],
  },
  // ===== Panel: Taste, Art & Tools =====
  {
    name: "Linus Ekenstam",
    position: "Co-founder @ FloCurve · Panel Host",
    photo: "/speakers/linus.jpeg",
    talkTitle: "Panel Host — Taste, Art & Tools",
    time: "19:05 (panel host)",
    notes: [
      "Co-founder of FloCurve (AI agent that finds high-intent leads on LinkedIn); panel host tonight.",
      "Product designer turned serial founder, 18 years building for Typeform, Flodesk and Thingtesting.",
      "AI evangelist and stage host — collaborated with Meta and Google, spoken at MWC and Imagine AI Live.",
    ],
  },
  {
    name: "Marc Ustrell",
    position: "Staff Content Designer @ Qonto",
    photo: "/speakers/marc.jpeg",
    talkTitle: "Panel — Taste, Art & Tools",
    time: "19:05 (panel)",
    notes: [
      "Staff Content Designer at Qonto (Europe's leading finance solution for SMEs & freelancers).",
      "Background in UX writing, localization and content systems.",
      "Builds Claude-powered tools in production, from localization automation to internal web apps.",
    ],
  },
  {
    name: "Alicia Comella",
    position: "Product design leader @ Perk",
    photo: "/speakers/alicia.jpeg",
    talkTitle: "Panel — Taste, Art & Tools",
    time: "19:05 (panel)",
    notes: [
      "Leads product design at Perk, guiding its shift to an AI-native travel experience.",
      "Previously ran a London design studio (Arup, Intel, Oxford University), then led design at Wallbox and The Knot Worldwide.",
      "Barcelona native with experience across the UK, Germany and Spain.",
    ],
  },
  {
    name: "Tim Rodenbröker",
    position: "Creative Coder",
    photo: "/speakers/tim.png",
    talkTitle: "Panel — Taste, Art & Tools",
    time: "19:05 (panel)",
    notes: [
      "Creative Coder.",
      "On the panel for taste, art and tools in creative work.",
      "(Add company / background if available.)",
    ],
  },
];

/**
 * The active event — "Claude for Design & Creativity", Barcelona, 10 June 2026.
 * El Raval, Barcelona. Hosts: Olivier Alter, Jeremie Benhamou, Matt Roberts,
 * Vaishali Rajurkar. Runs the demo directory + voting.
 */
export const designJun10: EventConfig = {
  slug: "design-jun10",
  title: "Claude for Design & Creativity",
  edition: "Barcelona",
  date: "10 June 2026",
  hostedBy: "Hosted by Claude Community · Olivier Alter, Jeremie Benhamou, Matt Roberts & Vaishali Rajurkar",
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
    { emoji: "🎨", text: "Claude for branding & identity" },
    { emoji: "✍️", text: "AI in the creative process vs. the output" },
    { emoji: "🧰", text: "Design tools & workflows with Claude" },
    { emoji: "🖼️", text: "Taste, craft & the role of the designer" },
    { emoji: "🚀", text: "Going from idea to polished design fast" },
    { emoji: "🤝", text: "Designers + developers + AI" },
  ],
  interestSuggestions: [
    "Branding with AI",
    "Design systems",
    "Creative workflows",
    "Claude for design",
    "Typography",
    "Prototyping fast",
    "Taste & craft",
    "Design + code",
    "Content design",
  ],
  targetAttendees: 80,
  demosEnabled: true,
  tonightSlides: [
    { kind: 'title' },
    {
      kind: 'agenda',
      title: 'Tonight',
      items: [
        { time: '6.00pm', label: 'Doors open' },
        { time: '6.25pm', label: 'Welcome' },
        { time: '6.40pm', label: 'Talk: Your AI looks like everyone else’s', sub: 'Laura Rosa Diaz Cañas & Iván González' },
        { time: '7.05pm', label: 'Panel: Taste, Art & Tools', sub: 'Linus, Marc, Alicia, Tim' },
        { time: '7.40pm', label: 'Community demos' },
        { time: '8.00pm', label: 'Cheese, wine & music' },
      ],
    },
    {
      kind: 'people',
      tag: 'Hosts',
      title: 'Your hosts tonight',
      people: [
        { name: 'Jérémie Benhamou', role: 'Founder @ The Tech Nation', photo: '/speakers/jeremie.jpeg' },
        { name: 'Matt Roberts', role: 'Founder @ Happy Operators', photo: '/speakers/matt.jpg' },
        { name: 'Vaishali Rajurkar', role: 'Lead Designer @ Adidas', photo: '/speakers/vaishali.jpeg' },
      ],
    },
    {
      kind: 'people',
      tag: 'Host',
      title: 'Your host tonight',
      people: [
        { name: 'Jérémie Benhamou', role: 'Founder @ The Tech Nation', photo: '/speakers/jeremie.jpeg' },
      ],
    },
    {
      kind: 'image',
      src: '/slide-tech-nation.png',
      alt: 'The Tech Nation — We do AI transformation. Cheese Tech & Wine #4, Crewly Cohort #3.',
    },
    {
      kind: 'people',
      tag: 'Host',
      title: 'Your host tonight',
      people: [
        { name: 'Matt Roberts', role: 'Founder @ Happy Operators', photo: '/speakers/matt.jpg' },
      ],
    },
    {
      kind: 'partner',
      brand: '🧱 Happy Operators',
      kicker: 'Community',
      titleLines: [
        { text: "Barcelona's leading" },
        { text: 'AI Operator', accent: true },
        { text: 'Community.' },
      ],
      subtitle: 'Community, Events, Education, Memes',
      stats: [
        { value: '500+', label: 'Community members', sub: 'Active builders across Barcelona & beyond' },
        { value: '413', label: 'Messages per week', sub: 'From 320+ active members' },
        { value: '24', label: 'Events run', sub: '1200+ total attendees, ~50 per event' },
      ],
      partnerLogos: [
        { src: '/logo-claude.svg', alt: 'Claude' },
        { src: '/partners/stripe.svg', alt: 'Stripe' },
        { src: '/partners/netlify.svg', alt: 'Netlify' },
        { src: '/partners/lovable.png', alt: 'Lovable' },
      ],
      qr: '/ho-qr.png',
      qrCaption: 'Scan to access',
    },
    {
      kind: 'people',
      tag: 'Host',
      title: 'Your host tonight',
      people: [
        { name: 'Vaishali Rajurkar', role: 'Lead Designer @ Adidas', photo: '/speakers/vaishali.jpeg' },
      ],
    },
    {
      kind: 'people',
      tag: 'Talk',
      title: 'Your AI looks like everyone else’s',
      people: [
        { name: 'Laura Rosa Diaz Cañas', role: 'Brand Strategist', photo: '/speakers/laurarosa.png' },
        { name: 'Iván González', role: 'Principal Engineer', photo: '/speakers/ivan.png' },
      ],
    },
    {
      kind: 'people',
      tag: 'Panel',
      title: 'Taste, Art & Tools',
      people: [
        { name: 'Linus Ekenstam', role: 'Co-founder @ Flocurve · Panel host', photo: '/speakers/linus.jpeg' },
        { name: 'Marc Ustrell', role: 'Staff Content Designer, Qonto', photo: '/speakers/marc.jpeg' },
        { name: 'Alicia Comella', role: 'Product design leader @ Perk', photo: '/speakers/alicia.jpeg' },
        { name: 'Tim Rodenbröker', role: 'Creative Coder', photo: '/speakers/tim.png' },
      ],
    },
    {
      kind: 'demosCta',
      title: 'Show us what you built',
      subtitle: 'Submit your project at /demos — it goes straight on the board.',
    },
    {
      kind: 'votePrizes',
      title: 'Vote for your favourites',
      subtitle: 'You get 3 votes. Top demo wins a prize. 🏆',
    },
    {
      kind: 'partner',
      brand: '🎵 Primavera',
      kicker: 'Tonight’s playlist',
      titleLines: [
        { text: 'Vote for the' },
        { text: 'Primavera', accent: true },
        { text: 'playlist.' },
      ],
      subtitle: 'Claude does the music. Scan to vote for what plays next.',
      qr: '/primavera-qr.png',
    },
  ],
  speakers: DESIGN_SPEAKERS,
  runOfShow: {
    venue: "El Raval, Barcelona (address visible to approved guests on Luma)",
    format: "Talk + panel + community demos + voting",
    schedule: [
      { time: "18:00", activity: "Doors open" },
      { time: "18:25", activity: "Welcome" },
      { time: "18:40", activity: "Talk: Your AI looks like everyone else’s — Laura Rosa Diaz Cañas & Iván González", highlight: true },
      { time: "19:05", activity: "Panel: Taste, Art & Tools — Linus, Marc, Alicia, Tim", highlight: true },
      { time: "19:40", activity: "Community demos — 3-min show & tell + voting", highlight: true },
      { time: "20:00", activity: "Cheese, wine & music", hard: true },
    ],
  },
};
