const DEVICE_KEY = 'claude-event-device-id';

/**
 * Stable per-device id for demo voting (3 votes per device). Generated once and
 * persisted in localStorage. Not tied to attendee registration.
 */
export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'ssr';
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `dev-${Math.random().toString(36).slice(2)}-${Date.now()}`;
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

/** A deterministic gradient (two hsl stops) from any string — for fallback cards. */
export function gradientFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  const h2 = (h + 48) % 360;
  return `linear-gradient(135deg, hsl(${h} 70% 52%), hsl(${h2} 68% 42%))`;
}

/** Deterministic stable shuffle: same seed + same ids → same order. */
export function seededShuffle<T extends { _id: string }>(items: T[], seed: number): T[] {
  // Hash each id with the seed → stable sort key. Stable across re-renders
  // (so vote updates don't reshuffle) but unique per page load (seed changes).
  const keyed = items.map((item) => {
    let h = seed >>> 0;
    for (let i = 0; i < item._id.length; i++) {
      h = (h ^ item._id.charCodeAt(i)) >>> 0;
      h = (h * 16777619) >>> 0;
    }
    return { item, key: h };
  });
  keyed.sort((a, b) => a.key - b.key);
  return keyed.map((k) => k.item);
}

/** Initials from a name, max 2 chars. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
