import type { EventConfig } from "./types";
import type { Speaker } from "../speakers";

/**
 * Panel + host for the design event. Sourced from the shared event doc.
 * These render on the host-notes /speakers page.
 */
const DESIGN_SPEAKERS: Speaker[] = [
  {
    name: "Marc Ustrell",
    position: "Staff Content Designer at Qonto",
    photo: "/speakers/placeholder.svg",
    talkTitle: "Panel — Taste, Art & Tools",
    time: "18:25 (panel)",
    bio: "Marc is a Staff Content Designer at Qonto, Europe's leading finance solution for SMEs and freelancers. Background in UX writing, localization, and content systems. He builds Claude-powered tools in production, from localization automation to internal web apps.",
    funFact: "Believes designers who thrive with AI are the ones who understand their own systems first.",
    questions: [
      {
        group: "Panel angle",
        items: [
          "How do you build Claude into a production design/content workflow without losing craft?",
          "What does 'understand your own systems first' look like in practice for a designer?",
        ],
      },
    ],
  },
  {
    name: "Alicia Comella",
    position: "Design Lead at Perk (AI-native travel)",
    photo: "/speakers/placeholder.svg",
    talkTitle: "Panel — Taste, Art & Tools",
    time: "18:25 (panel)",
    bio: "Alicia leads the travel design organisation at Perk, guiding a transformation toward an AI-native travel experience. Previously ran a London design studio delivering digital products for Arup, Intel, and Oxford University, then led design at Wallbox and The Knot Worldwide. Originally from Barcelona, with experience across the UK, Germany, and Spain.",
    funFact: "Helps business travellers focus on the trip, not the logistics.",
    questions: [
      {
        group: "Panel angle",
        items: [
          "How does AI change both the product and the design practice at the same time?",
          "What did moving from a studio to leading AI-native design teach you?",
        ],
      },
    ],
  },
  {
    name: "Linus Ekenstam",
    position: "Founder, FloCurve · Panel Host",
    photo: "/speakers/placeholder.svg",
    talkTitle: "Panel Host",
    time: "18:25 (panel host)",
    bio: "Product designer turned serial founder with 18 years building digital products for Typeform, Flodesk, and Thingtesting. Currently building FloCurve, an AI agent that finds high-intent leads on LinkedIn. AI evangelist and stage host; has collaborated with Meta and Google and spoken at Mobile World Congress, Imagine AI Live, and Upscale Conf. Serial founder of BedtimeStory.ai, Sensive, and Copygram.",
    funFact: "42% reply rates, 60 seconds from URL to live campaign, 10,000+ leads found with FloCurve.",
    questions: [
      {
        group: "Host prompts",
        items: [
          "Where does Claude augment humans while preserving what makes us uniquely human?",
          "What separates designers who thrive with AI from those who stall?",
        ],
      },
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
      kind: 'people',
      tag: 'Hosts',
      title: 'Your hosts tonight',
      people: [
        { name: 'Vaishali Rajurkar', role: 'Lead Designer', photo: '/speakers/vaishali.jpeg' },
        { name: 'Matt Roberts', role: 'Founder @ Happy Operators', photo: '/speakers/matt.jpg' },
        { name: 'Jérémie Benhamou', role: 'Founder @ The Tech Nation', photo: '/speakers/jeremie.jpeg' },
      ],
    },
    {
      kind: 'people',
      tag: 'Host',
      title: 'Your host tonight',
      people: [
        { name: 'Vaishali Rajurkar', role: 'Lead Designer', photo: '/speakers/vaishali.jpeg' },
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
      kind: 'agenda',
      title: 'Tonight',
      items: [
        { time: '6.00pm', label: 'Doors open' },
        { time: '6.25pm', label: 'Welcome' },
        { time: '6.40pm', label: 'Talk: How to not make AI Slop · Laura Rosa Diaz Cañas & Iván González' },
        { time: '7.05pm', label: 'Panel: Taste, Art & Tools · Linus, Marc, Alicia, Tim' },
        { time: '7.40pm', label: 'Community demos' },
        { time: '8.00pm', label: 'Cheese, wine & music' },
      ],
    },
    {
      kind: 'people',
      tag: 'Panel',
      title: 'Taste, Art & Tools',
      people: [
        { name: 'Linus Ekenstam', role: 'Co-founder @ Flocurve · Panel host', photo: '/speakers/linus.jpeg' },
        { name: 'Marc Ustrell Hernandez', role: 'Staff Content Designer, Qonto', photo: '/speakers/marc.jpeg' },
        { name: 'Alicia Comella', role: 'Product design leader @ Perk', photo: '/speakers/alicia.jpeg' },
        { name: 'Tim Rodenbröker', role: 'Creative Coder', photo: '/speakers/tim.png' },
      ],
    },
    {
      kind: 'people',
      tag: 'Talk',
      title: 'How to not make AI Slop',
      people: [
        { name: 'Laura Rosa Diaz Cañas', role: 'Brand Strategist', photo: '/speakers/laurarosa.png' },
        { name: 'Iván González', role: 'Principal Engineer', photo: '/speakers/ivan.png' },
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
  ],
  speakers: DESIGN_SPEAKERS,
  runOfShow: {
    venue: "El Raval, Barcelona (address visible to approved guests on Luma)",
    format: "Talk + panel + community demos + voting",
    schedule: [
      { time: "18:00", activity: "Doors open" },
      { time: "18:25", activity: "Welcome" },
      { time: "18:40", activity: "Talk: How to not make AI Slop — Laura Rosa Diaz Cañas & Iván González", highlight: true },
      { time: "19:05", activity: "Panel: Taste, Art & Tools — Linus, Marc, Alicia, Tim", highlight: true },
      { time: "19:40", activity: "Community demos — 3-min show & tell + voting", highlight: true },
      { time: "20:00", activity: "Cheese, wine & music", hard: true },
    ],
  },
};
