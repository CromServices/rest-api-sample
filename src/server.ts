import { createApp } from "./app.ts";
import { loadStarterConfig } from "./config.ts";

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

const config = loadStarterConfig();
const app = createApp({ config });

const server = app.listen(port, host, () => {
  console.log(`${config.name} listening on ${host}:${port}`);
});

function shutdown(signal: string): void {
  console.log(`${signal} received, closing`);
  server.close(() => process.exit(0));
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
