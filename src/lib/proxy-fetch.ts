import { ProxyAgent, fetch as undiciFetch } from "undici";

const proxy = process.env.DATAIMPULSE_PROXY_URL;
const dispatcher = proxy ? new ProxyAgent(proxy) : undefined;

export function proxyFetch(input: string, init?: RequestInit): Promise<Response> {
  const requestInit = { ...init, dispatcher } as unknown as Parameters<typeof undiciFetch>[1];
  return undiciFetch(input, requestInit) as unknown as Promise<Response>;
}
