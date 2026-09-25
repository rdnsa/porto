import { createReadStream, statSync } from "node:fs";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const mediaDir = path.resolve(import.meta.dirname, "media");
const types: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};

// Dev only: serve /media/* from ./media (the same files uploaded to R2), so `npm run dev`
// works without Wrangler. In production the Pages Function streams them from R2.
function localMedia(): Plugin {
  return {
    name: "local-media",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/media", (req, res, next) => {
        const file = path.join(mediaDir, decodeURIComponent((req.url ?? "/").split("?")[0]));
        if (!file.startsWith(mediaDir + path.sep)) return next();
        try {
          if (!statSync(file).isFile()) return next();
        } catch {
          return next();
        }
        res.setHeader("Content-Type", types[path.extname(file)] ?? "application/octet-stream");
        createReadStream(file).pipe(res);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), localMedia()],
  // `npm run dev:api` runs the Pages Functions (D1/R2 bindings) on :8788.
  server: { proxy: { "/api": "http://127.0.0.1:8788" } },
});
