import crypto from "node:crypto";

const cookieName = "mgteam_downloader_session";

function sign(value: string) {
  return crypto.createHmac("sha256", process.env.SESSION_SECRET || "").update(value).digest("base64url");
}

export function createSession() {
  const value = `${Date.now() + 1000 * 60 * 60 * 12}`;
  return `${value}.${sign(value)}`;
}

export function isSessionValid(session?: string) {
  if (!session || !process.env.SESSION_SECRET) return false;
  const [expires, signature] = session.split(".");
  if (!expires || !signature || Number(expires) <= Date.now()) return false;
  const received = Buffer.from(signature);
  const expected = Buffer.from(sign(expires));
  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
}

export { cookieName };
