import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getEventConfig, type EventConfig } from "./index";

export interface ResolvedEvent {
  /** DB event doc (null while loading or if none exists). */
  event: ReturnType<typeof useQuery<typeof api.events.getActive>> | null;
  /** Code config for the resolved event (always defined — falls back). */
  config: EventConfig;
  /** The slug we resolved to (from DB, or the config fallback). */
  slug: string;
  /** Whether this is an archived (read-only) event. */
  isArchived: boolean;
}

/**
 * Resolve the event for the active surfaces (no slug) or an archived view
 * (pass the slug from the /prev/<slug> route). The DB is the source of truth
 * for which event is active; the code config supplies its content.
 */
export function useEvent(archiveSlug?: string): ResolvedEvent {
  const active = useQuery(api.events.getActive, archiveSlug ? "skip" : {});
  const archived = useQuery(
    api.events.getBySlug,
    archiveSlug ? { slug: archiveSlug } : "skip"
  );

  const dbEvent = archiveSlug ? archived : active;
  const slug = dbEvent?.slug ?? archiveSlug ?? undefined;
  const config = getEventConfig(slug);

  return {
    event: (dbEvent ?? null) as ResolvedEvent["event"],
    config,
    slug: config.slug,
    isArchived: !!archiveSlug || !!dbEvent?.isArchived,
  };
}
