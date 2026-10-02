import express, { type NextFunction, type Request, type Response } from "express";
import { loadStarterConfig, type StarterConfig } from "./config.ts";
import { InMemoryStore } from "./store/memory.ts";
import type { Store } from "./store/store.ts";
import { itemsRouter, type Item } from "./routes/items.ts";

export type AppOptions = {
  /** Storage for the example items route. Defaults to in-memory. */
  itemStore?: Store<Item>;
  /** Per-project name/description. Defaults to package.json starter.config. */
  config?: StarterConfig;
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c,
  );
}

function rootPage(config: StarterConfig): string {
  const name = escapeHtml(config.name);
  const description = escapeHtml(config.description);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${name}</title>
<!-- CROM THEME SLOT: shared light theme from crom-shared (may 404 until it is published). Do not add inline or copied CSS. -->
<link rel="stylesheet" href="https://cromservices.github.io/crom-shared/theme.css">
</head>
<body>
<main>
<h1>${name}</h1>
<p>${description}</p>
<p><a href="/health">/health</a></p>
</main>
<footer>
<!-- CROM THEME SLOT: replace with crom-shared footer when live -->
<p>Built by <a href="https://cromservices.com.au">Crom Services, Australia</a></p>
</footer>
</body>
</html>
`;
}

/** Build the Express app. Kept separate from server.ts so tests can start it on any port. */
export function createApp(opts: AppOptions = {}) {
  const config = opts.config ?? loadStarterConfig();
  const itemStore = opts.itemStore ?? new InMemoryStore<Item>();

  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "32kb" }));

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.get("/", (_req, res) => {
    res.status(200).type("html").send(rootPage(config));
  });

  app.use("/items", itemsRouter(itemStore));

  app.use((_req, res) => {
    res.status(404).json({ error: "not found" });
  });

  // Malformed JSON and other errors: JSON reply, no stack trace leak.
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const status =
      typeof err === "object" && err !== null && "status" in err && typeof err.status === "number"
        ? err.status
        : 500;
    res.status(status).json({ error: status === 500 ? "internal error" : "bad request" });
  });

  return app;
}
