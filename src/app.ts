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
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${name}</title>
<!-- Firm theme, pinned to crom-shared v1.0.0 (light by default, dark when the system prefers it). Do not add inline or copied CSS. -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/CromServices/crom-shared@v1.0.0/theme.css">
</head>
<body>
<main class="crom-shell">
<section style="padding: 56px 0 8px;">
<h1 class="crom-h1">${name}</h1>
<p class="crom-lead">${description}</p>
<p><a href="/health">/health</a></p>
</section>
<!-- Crom footer and credit: crom-shared v1.0.0 snippets/footer.html, verbatim. -->
<footer class="crom-footer">
  <p class="crom-footer__line">Crom Services · Australia · <a href="mailto:cromservices@gmail.com">cromservices@gmail.com</a></p>
  <div class="crom-footer__credit">
    <span class="crom-when-light">
      <a href="https://cromservices.com.au" target="_blank" rel="noopener noreferrer"
         aria-label="Built by Crom Services"
         style="display:inline-flex;align-items:center;gap:8px;text-decoration:none;color:#4a5752;font-family:Inter,system-ui,sans-serif;font-size:12px;font-weight:500;line-height:1;">
        <img src="https://cromservices.com.au/brand/credit/crom-credit-mark-ink@1x.png"
             srcset="https://cromservices.com.au/brand/credit/crom-credit-mark-ink@1x.png 1x, https://cromservices.com.au/brand/credit/crom-credit-mark-ink@2x.png 2x, https://cromservices.com.au/brand/credit/crom-credit-mark-ink@3x.png 3x"
             width="34" height="18" alt="" style="display:block;height:18px;width:auto;">
        <span>Built by Crom Services</span>
      </a>
    </span>
    <span class="crom-when-dark">
      <a href="https://cromservices.com.au" target="_blank" rel="noopener noreferrer"
         aria-label="Built by Crom Services"
         style="display:inline-flex;align-items:center;gap:8px;text-decoration:none;color:#cdd6d1;font-family:Inter,system-ui,sans-serif;font-size:12px;font-weight:500;line-height:1;">
        <img src="https://cromservices.com.au/brand/credit/crom-credit-mark-white@1x.png"
             srcset="https://cromservices.com.au/brand/credit/crom-credit-mark-white@1x.png 1x, https://cromservices.com.au/brand/credit/crom-credit-mark-white@2x.png 2x, https://cromservices.com.au/brand/credit/crom-credit-mark-white@3x.png 3x"
             width="34" height="18" alt="" style="display:block;height:18px;width:auto;">
        <span>Built by Crom Services</span>
      </a>
    </span>
  </div>
</footer>
</main>
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
