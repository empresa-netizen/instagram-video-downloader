import { ProxyAgent, fetch as undiciFetch } from "undici";

const proxy = process.env.DATAIMPULSE_PROXY_URL;
const dispatcher = proxy ? new ProxyAgent(proxy) : undefined;

export function proxyFetch(input: string, init?: RequestInit): Promise<Response> {
  return undiciFetch(input, { ...init, dispatcher }) as unknown as Promise<Response>;
}
