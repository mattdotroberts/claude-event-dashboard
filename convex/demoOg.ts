"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

/** A single attribute value out of a tag string, e.g. content="...". */
function attr(tag: string, name: string): string | null {
  const m = tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, "i"));
  return m?.[1] ?? null;
}

/**
 * Pull a meta tag's content by property/name. Scans every <meta> tag and
 * checks attributes independently, so it's robust to attribute order and to
 * extra attributes interleaved between property and content (e.g. Next.js's
 * `data-next-head`), which broke the old adjacency-based regex.
 */
function metaContent(html: string, key: string): string | null {
  const metas = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of metas) {
    const prop = (attr(tag, "property") ?? attr(tag, "name") ?? "").toLowerCase();
    if (prop === key.toLowerCase()) {
      const content = attr(tag, "content");
      if (content) return decodeEntities(content.trim());
    }
  }
  return null;
}

/**
 * Best site icon as an OG-image fallback: apple-touch-icon (usually 180px+),
 * else the largest-declared <link rel="icon">. Returns the raw href.
 */
function iconHref(html: string): string | null {
  const links = html.match(/<link\b[^>]*>/gi) ?? [];
  let appleIcon: string | null = null;
  let bestIcon: { href: string; size: number } | null = null;
  for (const tag of links) {
    const rel = (attr(tag, "rel") ?? "").toLowerCase();
    const href = attr(tag, "href");
    if (!href) continue;
    if (rel.includes("apple-touch-icon")) {
      // Prefer apple-touch-icon — these are large and square.
      if (!appleIcon) appleIcon = href;
    } else if (rel.includes("icon")) {
      const sizes = attr(tag, "sizes") ?? "";
      const size = parseInt(sizes.split("x")[0], 10) || 0;
      if (!bestIcon || size > bestIcon.size) bestIcon = { href, size };
    }
  }
  return appleIcon ?? bestIcon?.href ?? null;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

function pageTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m?.[1] ? decodeEntities(m[1].trim()) : null;
}

/** Resolve a possibly-relative image URL against the page URL. */
function absoluteUrl(maybeRelative: string, base: string): string | null {
  try {
    return new URL(maybeRelative, base).toString();
  } catch {
    return null;
  }
}

/**
 * Try each candidate URL in order; download + store the first that returns a
 * valid image. Returns the storage id, or undefined if none worked.
 */
async function downloadFirst(
  ctx: { storage: { store: (blob: Blob) => Promise<string> } },
  candidates: string[],
  base: string
): Promise<string | undefined> {
  for (const raw of candidates) {
    const imgUrl = absoluteUrl(raw, base);
    if (!imgUrl) continue;
    try {
      const imgRes = await fetch(imgUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; ClaudeEventBot/1.0)" },
      });
      const contentType = imgRes.headers.get("content-type") ?? "";
      if (imgRes.ok && contentType.startsWith("image/")) {
        const blob = await imgRes.blob();
        if (blob.size > 0 && blob.size < 8 * 1024 * 1024) {
          return await ctx.storage.store(blob);
        }
      }
    } catch {
      // try the next candidate
    }
  }
  return undefined;
}

/**
 * Fetch the demo's project URL, extract OG metadata, download the OG image,
 * and store it in Convex storage. Best-effort: any failure leaves the demo
 * without a stored image so the UI falls back to the gradient card.
 */
export const fetchAndStore = internalAction({
  args: { demoId: v.id("demos") },
  handler: async (ctx, args): Promise<void> => {
    const info = await ctx.runMutation(internal.demos._getDemoUrl, {
      demoId: args.demoId,
    });
    if (!info || info.hasImage) return;

    let url = info.projectUrl.trim();
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;

    try {
      const res = await fetch(url, {
        headers: {
          // Some sites serve richer OG tags to crawler-like UAs.
          "User-Agent":
            "Mozilla/5.0 (compatible; ClaudeEventBot/1.0; +https://claude.com/community)",
          Accept: "text/html",
        },
        redirect: "follow",
      });
      if (!res.ok) return;
      const html = (await res.text()).slice(0, 500_000);

      const ogTitle =
        metaContent(html, "og:title") ?? pageTitle(html) ?? undefined;
      const ogDescription =
        metaContent(html, "og:description") ??
        metaContent(html, "description") ??
        undefined;
      const base = res.url || url;

      // Hero image = a real preview image only (og:image / twitter:image).
      // No icon here — sites without one fall back to the gradient card.
      const heroCandidates = [
        metaContent(html, "og:image"),
        metaContent(html, "og:image:url"),
        metaContent(html, "og:image:secure_url"),
        metaContent(html, "twitter:image"),
        metaContent(html, "twitter:image:src"),
      ].filter((x): x is string => !!x);

      const imageStorageId = await downloadFirst(ctx, heroCandidates, base);

      // Favicon = small site icon shown next to the project name on every card.
      const icon = iconHref(html);
      const faviconStorageId = icon
        ? await downloadFirst(ctx, [icon], base)
        : undefined;

      await ctx.runMutation(internal.demos._setDemoOg, {
        demoId: args.demoId,
        imageStorageId: imageStorageId as never,
        faviconStorageId: faviconStorageId as never,
        ogTitle,
        ogDescription,
      });
    } catch {
      // Network / parse failure → leave demo imageless (gradient fallback)
    }
  },
});
