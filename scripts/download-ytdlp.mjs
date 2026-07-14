import { chmod, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const binaryPath = path.join(process.cwd(), "bin", "yt-dlp");
const asset = process.platform === "linux" ? "yt-dlp_linux" : process.platform === "darwin" ? "yt-dlp_macos" : "yt-dlp.exe";

await mkdir(path.dirname(binaryPath), { recursive: true });
const response = await fetch(`https://github.com/yt-dlp/yt-dlp/releases/latest/download/${asset}`);
if (!response.ok) throw new Error(`Unable to download yt-dlp (${response.status})`);
await writeFile(binaryPath, Buffer.from(await response.arrayBuffer()));
await chmod(binaryPath, 0o755);
