import type { EventConfig } from "./types";
import { buildersThree } from "./builders-3";
import { designJun10 } from "./design-jun10";

export type {
  EventConfig,
  SeedTopic,
  EventLogo,
  ScheduleRow,
  TonightSlide,
  SlidePerson,
} from "./types";

/** All known event configs, keyed by slug. */
export const EVENT_CONFIGS: Record<string, EventConfig> = {
  [buildersThree.slug]: buildersThree,
  [designJun10.slug]: designJun10,
};

/**
 * The slug used when the DB hasn't told us which event is active yet (first
 * paint, before useQuery resolves). Keep this pointed at the current event.
 */
export const FALLBACK_SLUG = designJun10.slug;

/** Look up a config by slug, falling back to the current event's config. */
export function getEventConfig(slug?: string | null): EventConfig {
  if (slug && EVENT_CONFIGS[slug]) return EVENT_CONFIGS[slug];
  return EVENT_CONFIGS[FALLBACK_SLUG];
}
