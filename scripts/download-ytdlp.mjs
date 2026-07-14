import { mkdir } from "node:fs/promises";
import path from "node:path";
import YTDlpWrapModule from "yt-dlp-wrap";

const binaryPath = path.join(process.cwd(), "bin", "yt-dlp");
await mkdir(path.dirname(binaryPath), { recursive: true });
await YTDlpWrapModule.default.downloadFromGithub(binaryPath);
