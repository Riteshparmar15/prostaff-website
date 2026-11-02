import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

const FILE_OUT_DIR = 'dist-file';

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

/** 404.html is served at any missing URL depth, so its links need the absolute base path. */
const notFoundPage = (base) => {
  let outDir;
  return {
    name: 'not-found-page',
    apply: 'build',
    configResolved: (config) => {
      outDir = config.build.outDir;
    },
    async closeBundle() {
      const path = resolve(outDir, '404.html');
      const html = await readFile(path, 'utf8').catch(() => null);
      if (html) await writeFile(path, html.replaceAll('%BASE%', base));
    },
  };
};

/** Netlify and custom domains serve from the root; GitHub Pages serves this repo from a sub-folder. */
const BASES = { file: './', ghpages: '/prostaff-website/' };

export default defineConfig(({ mode }) => {
  const base = BASES[mode] ?? '/';
  return {
    server: {
      host: true,
      port: 5173,
    },
    plugins: [
      react(),
      stripFileRedirect(),
      notFoundPage(base),
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
    define: {
      // Netlify Forms only exists on Netlify, which sets NETLIFY=true during its builds
      'import.meta.env.VITE_NETLIFY_FORM': JSON.stringify(
        process.env.VITE_NETLIFY_FORM ?? (process.env.NETLIFY === 'true' ? 'enquiry' : ''),
      ),
    },
    ...(mode === 'file' && { build: { outDir: FILE_OUT_DIR } }),
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.{js,jsx}'],
      setupFiles: ['./src/test/setup.js'],
      css: false,
    },
  };
});
