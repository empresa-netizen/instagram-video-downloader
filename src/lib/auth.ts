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
  return Boolean(expires && signature && Number(expires) > Date.now() && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(sign(expires))));
}

export { cookieName };
