import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isShortcodePresent(url: string) {
  const regex = /\/(p|reel)\/([a-zA-Z0-9_-]+)\/?/;
  const match = url.match(regex);

  if (match && match[2]) {
    return true;
  }

  return false;
}

export function getPostShortcode(url: string): string | null {
  const regex = /\/(p|reel)\/([a-zA-Z0-9_-]+)\/?/;
  const match = url.match(regex);

  if (match && match[2]) {
    const shortcode = match[2];
    return shortcode;
  } else {
    return null;
  }
}

function stripDiacritics(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function sanitizeFilenamePart(value: string) {
  return stripDiacritics(value)
    .replace(/[^\w\s-]+/g, " ")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export function getCaptionFirstWords(caption: string, count = 3) {
  return caption
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, count)
    .join(" ");
}

/**
 * Builds download basename as: {username}_{first-3-caption-words}
 * Example: mgteamoficial_a-equipe-esta
 */
export function buildDownloadBasename(
  username?: string | null,
  caption?: string | null
) {
  const userPart = sanitizeFilenamePart(username || "instagram") || "instagram";
  const captionWords = getCaptionFirstWords(caption || "", 3);
  const captionPart =
    sanitizeFilenamePart(captionWords) || "post";

  return `${userPart}_${captionPart}`.slice(0, 120);
}
