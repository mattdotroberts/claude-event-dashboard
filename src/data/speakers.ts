export interface Speaker {
  name: string;
  position: string;
  photo: string;
  talkTitle: string;
  /** Time on the schedule, e.g. "18:40". */
  time?: string;
  /** Short scannable bio (read out from stage). */
  bio?: string;
  /** Grouped starter questions. */
  questions?: { group: string; items: string[] }[];
}

export const SPEAKERS: Speaker[] = [
  {
    name: 'Al Ste-Marie',
    position: 'Founder, The Unsold Group',
    photo: '/speakers/al.jpeg',
    talkTitle: 'Hatching Flipper 🐧 with Claude Managed Agents',
    time: '18:40',
    bio: 'Al is the founder of The Unsold Group. He has been building Flipper 🐧 — an experiment in running a real product end-to-end with Claude Managed Agents. If you want to know what happens when you stop treating AI like a tool and start treating it like a co-founder, Al is your person. (TODO: confirm + tighten with Al.)',
    questions: [
      {
        group: 'Easy / warm-up',
        items: [
          "For anyone here who hasn't tried Claude Managed Agents yet, what's the simplest thing they could spin up tomorrow?",
          'Where did the name Flipper come from? Why a penguin?',
        ],
      },
      {
        group: 'Setup and workflow',
        items: [
          "Walk us through how Flipper actually runs day-to-day. What's the agent doing while you sleep?",
          'Which other tools sit alongside Claude in the stack? Notion, Linear, your own infra?',
          "How do you decide what stays in your hands and what gets handed to a managed agent?",
        ],
      },
      {
        group: 'Personal / story',
        items: [
          "How did The Unsold Group end up here? Was there a moment where you thought 'this is the real shift'?",
          "What's the most surprising thing an agent has done on Flipper without being explicitly asked?",
        ],
      },
      {
        group: 'Deeper / provocative',
        items: [
          "What's the biggest thing a managed agent has got completely wrong, and what did you learn?",
          "Where do managed agents still fall apart? What do you refuse to hand over?",
          'If someone in this room wanted to ship a Flipper-style product in 30 days, what would you tell them to do first?',
        ],
      },
    ],
  },
  {
    name: 'Heather Thacker',
    position: 'Developer Advocate at Gatling',
    photo: '/speakers/heather.jpeg',
    talkTitle: 'Developer Content Flywheel: Using Claude to Turn Code Into Career Capital',
    time: '19:10',
    bio: 'Heather is a Developer Advocate at Gatling. She has spent the last year turning a developer content flywheel into actual career capital — using Claude to translate code into talks, posts, demos, and audience. If you want to know how to compound your engineering output into a public footprint, Heather has done it. (TODO: confirm + tighten with Heather.)',
    questions: [
      {
        group: 'Easy / warm-up',
        items: [
          'For the engineers here who have never written anything public, what would you tell them to try first?',
          "What's one Claude habit you use every single day that you'd recommend to anyone in this room?",
        ],
      },
      {
        group: 'Setup and workflow',
        items: [
          "Walk us through your content flywheel. What's the loop from code → post → talk?",
          'Which tools sit alongside Claude in your daily work? Anything unexpected?',
          'How much of the writing is Claude and how much is you? Where do you draw the line?',
        ],
      },
      {
        group: 'Personal / story',
        items: [
          'How did you end up in developer advocacy? Was there a specific moment you decided to go public?',
          "What's a post or talk that completely flopped, and what did you learn from it?",
        ],
      },
      {
        group: 'Deeper / provocative',
        items: [
          'A lot of devs say "I have nothing original to say." How do you push back on that?',
          'Where does using AI to write content cross a line for you?',
          'For someone in this room who wants to build their own career capital, what should they do on Monday morning?',
        ],
      },
    ],
  },
  {
    name: 'Sergey Cherepanov',
    position: 'CTO of Guass',
    photo: '/speakers/sergey.jpeg',
    talkTitle: 'Razzmatazzing and Recombobulating: A harness for testing',
    time: '19:40',
    bio: 'Sergey is CTO of Guass. He has been building a testing harness that combines Claude with a deliberately playful approach to making sure code actually works — what he calls razzmatazzing and recombobulating. If you have ever stared at a flaky test suite and wished there was a smarter way through, Sergey has been living that problem. (TODO: confirm + tighten with Sergey.)',
    questions: [
      {
        group: 'Easy / warm-up',
        items: [
          "Razzmatazzing and Recombobulating — give us the 30-second version. What do those words actually mean in your harness?",
          "What's the smallest thing someone could try with Claude on their test suite tomorrow?",
        ],
      },
      {
        group: 'Setup and workflow',
        items: [
          "Walk us through the harness. What's it doing that a regular CI pipeline isn't?",
          'Where does Claude sit in the loop — writing tests, fixing tests, both?',
          'What other tools are in the stack at Guass?',
        ],
      },
      {
        group: 'Personal / story',
        items: [
          'How did you end up CTO at Guass? What does the company actually do?',
          "What was the bug or failure that made you build this harness in the first place?",
        ],
      },
      {
        group: 'Deeper / provocative',
        items: [
          'A lot of teams treat AI-generated tests as suspicious. Why are they wrong, or right?',
          "Where does the harness still fall apart? What can't you automate yet?",
          'If we are all going to be supervising more agents than humans soon, what does QA actually look like in 2 years?',
        ],
      },
    ],
  },
  {
    name: 'Sara Noureldin',
    position: 'CTO of Anda',
    photo: '/speakers/sara.png',
    talkTitle: 'Decoding how an African city moves with Claude Code',
    time: '20:10',
    bio: 'Sara Noureldin is CTO of Anda, building driver-financing rails for ride-hailing. Previously Microsoft Cloud and BCG AI, now scaling engineering with Claude Code as her force multiplier.',
    questions: [
      {
        group: 'Easy / warm-up',
        items: [
          'For people here who think of Claude as a coding tool, what does "decoding a city" actually mean?',
          "What's the most surprising thing you've learned about how the city moves that nobody talks about?",
        ],
      },
      {
        group: 'Setup and workflow',
        items: [
          'Walk us through the data and the pipeline. What does Claude actually see?',
          'Which other tools sit alongside Claude in the stack? Maps, sensors, drivers?',
          'How much of this is offline analysis vs. real-time decisions on the ground?',
        ],
      },
      {
        group: 'Personal / story',
        items: [
          'How did Anda come to be? Why this problem, why now?',
          'What does it feel like to use Claude Code in a context most of its training data probably never imagined?',
        ],
      },
      {
        group: 'Deeper / provocative',
        items: [
          'Most AI products are built for users in San Francisco or Berlin. How does that bias show up when you take Claude to your city?',
          "Where does Claude get the city wrong? What's the gap between what the model sees and what's actually happening?",
          'If you could give the next version of Claude one thing for problems like this, what would it be?',
        ],
      },
    ],
  },
];

/** Stable kebab-case anchor id for each speaker, used by the /speakers TOC. */
export function speakerSlug(speaker: Speaker): string {
  return speaker.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
