import type { Speaker } from "../speakers";

/** A single seed discussion topic for an event. */
export interface SeedTopic {
  text: string;
  emoji?: string;
}

/** A logo shown in the event header. */
export interface EventLogo {
  src: string;
  name?: string;
  url: string;
  className: string;
}

/** A row in the run-of-show schedule. */
export interface ScheduleRow {
  time: string;
  activity: string;
  highlight?: boolean;
  hard?: boolean;
}

/** A person shown on a panel/talk slide. */
export interface SlidePerson {
  name: string;
  role?: string;
  photo?: string;
}

/**
 * A slide in the "Tonight" deck (opened from the dashboard "Tonight" button).
 * The deck is driven entirely by the active event's config, so each event ships
 * its own run-of-night without touching component code.
 */
export type TonightSlide =
  | { kind: 'title' }
  | { kind: 'agenda'; title?: string; items: { time?: string; label: string }[] }
  | { kind: 'people'; tag: string; title: string; people: SlidePerson[] }
  | { kind: 'demosCta'; title: string; subtitle: string }
  | { kind: 'votePrizes'; title: string; subtitle: string }
  | { kind: 'saveTheDate'; date: string; title: string; subtitle: string }
  | { kind: 'image'; src: string; alt: string }
  | {
      kind: 'partner';
      brand: string;
      kicker?: string;
      /** Title parts; alternates default/accent colour for emphasis. */
      titleLines: { text: string; accent?: boolean }[];
      subtitle?: string;
      footer?: string;
      qr?: string;
      qrCaption?: string;
      /** Headline stats row (big number + label + sub). */
      stats?: { value: string; label: string; sub?: string }[];
      /** Partner logos shown along the bottom (image src + alt). */
      partnerLogos?: { src: string; alt: string }[];
    };

/**
 * Everything that makes an event an event, in code. Keyed by `slug`, which
 * matches the DB events row. To set up the next event, copy a config file,
 * edit it, and flip the active event in admin (or via startNextEvent).
 */
export interface EventConfig {
  /** Must match the DB events.slug. */
  slug: string;
  /** Big title, e.g. "Claude Code for Builders". */
  title: string;
  /** Edition / locale tag, e.g. "Barcelona #3". */
  edition: string;
  /** Human date string, e.g. "10 June 2026". */
  date: string;
  /** One-line hosted-by credit. */
  hostedBy: string;
  /** Header logos. */
  logos: EventLogo[];
  /** Seed discussion topics for the room. */
  seedTopics: SeedTopic[];
  /** Interest chip suggestions on the join flow. */
  interestSuggestions: string[];
  /** Target attendee count for the dashboard progress bar. */
  targetAttendees: number;
  /** Whether this event runs the demo directory + voting. */
  demosEnabled: boolean;
  /** The "Tonight" deck slides for this event (optional). */
  tonightSlides?: TonightSlide[];
  /** Host-notes speakers (optional). */
  speakers?: Speaker[];
  /** Run-of-show metadata (optional). */
  runOfShow?: {
    venue?: string;
    room?: string;
    eventManager?: string;
    format?: string;
    schedule: ScheduleRow[];
  };
}
