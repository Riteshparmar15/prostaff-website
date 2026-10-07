import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

const FILE_OUT_DIR = 'dist-file';

/**
 * Dev-only mock for POST /api/contact so the contact form can be exercised
 * locally. Replace with a real endpoint (serverless function, CRM webhook…)
 * in production.
 */
const mockContactApi = () => ({
  name: 'mock-contact-api',
  configureServer(server) {
    server.middlewares.use('/api/contact', (req, res, next) => {
      if (req.method !== 'POST') return next();
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        console.log('[mock /api/contact]', body);
        setTimeout(() => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: true }));
        }, 900);
      });
    });
  },
});

/**
 * `npm run build:file` output must open straight from disk (file://), where a
 * leading "/" means the drive root, so site paths are rewritten as relative.
 */
const relativePaths = () => ({
  name: 'relative-paths',
  transform(code, id) {
    if (!id.endsWith('/src/data/content.js')) return null;
    return code.replace(/(['"])\/(images\/|privacy\.html|terms\.html)/g, '$1./$2');
  },
  transformIndexHtml: {
    order: 'post',
    handler: (html) =>
      html
        .replace(/(href|src)="\/(?!\/)/g, '$1="./')
        .replace(/(imagesrcset="|, )\/images\//g, '$1./images/'),
  },
  async closeBundle() {
    for (const page of ['privacy.html', 'terms.html']) {
      const path = resolve(FILE_OUT_DIR, page);
      const html = await readFile(path, 'utf8');
      await writeFile(
        path,
        html.replace(/href="\/"/g, 'href="index.html"').replace(/(href|src)="\/(?!\/)/g, '$1="./'),
      );
    }
  },
});

/** The source index.html forwards file:// visitors to dist-file; built pages must not. */
const stripFileRedirect = () => ({
  name: 'strip-file-redirect',
  apply: 'build',
  transformIndexHtml: (html) =>
    html.replace(/\s*<!-- file-open-redirect:start -->[\s\S]*?<!-- file-open-redirect:end -->/, ''),
});

export default defineConfig(({ command, mode }) => {
  const base = command === 'serve' ? '/' : (mode === 'file' ? './' : '/prostaff-website/');
  return {
    server: {
      host: true,
      port: 5173,
    },
    plugins: [
      react(),
      mockContactApi(),
      stripFileRedirect(),
      {
        name: 'fix-html-asset-paths',
        transformIndexHtml: {
          order: 'post',
          handler: (html) => {
            const b = base.endsWith('/') ? base : `${base}/`;
            return html
              .replace(/(imagesrcset="|, )\/images\//g, `$1${b}images/`)
              .replace(/(href|src)="\/(images|favicon|apple-touch|privacy\.html|terms\.html|legal\.css|logo-mark)/g, `$1="${b}$2`)
              .replace(/href="\/"/g, `href="${b}"`);
          },
        },
      },
      ...(mode === 'file' ? [relativePaths(), viteSingleFile()] : []),
    ],
    base,
    ...(mode === 'file' && { build: { outDir: FILE_OUT_DIR } }),
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.js'],
      css: false,
    },
  };
});
