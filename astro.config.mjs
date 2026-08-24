// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { join, normalize } from 'node:path';

/**
 * @returns {import('vite').VitePlugin}
 */
function pagefindDevServer() {
  return {
    name: 'pagefind-dev-server',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url ?? '').split('?')[0];
        if (!url.startsWith('/pagefind/')) return next();
        const dist = normalize(join(process.cwd(), 'dist'));
        const file = normalize(join(dist, url));
        if (
          !file.startsWith(dist) ||
          !existsSync(file) ||
          !statSync(file).isFile()
        ) {
          res.statusCode = 404;
          res.end('Pagefind index not found. Run `npm run build` first.');
          return;
        }
        const type = file.endsWith('.js')
          ? 'text/javascript'
          : file.endsWith('.css')
            ? 'text/css'
            : file.endsWith('.json')
              ? 'application/json'
              : 'application/octet-stream';
        res.setHeader('Content-Type', type);
        createReadStream(file).pipe(res);
      });
    },
  };
}

export default defineConfig({
  site: 'https://zhu3899.github.io',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'one-dark-pro' },
    },
  },
  vite: {
    plugins: [tailwindcss(), pagefindDevServer()],
  },
});
