// Injects the server-rendered markup into dist/index.html so crawlers and
// no-JS visitors get real content. The client still mounts with createRoot.
import { readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const htmlPath = path.join(root, 'dist', 'index.html');
const ssrDir = path.join(root, 'dist-ssr');
const PLACEHOLDER = '<div id="root"></div>';

const { render } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href);
const html = await readFile(htmlPath, 'utf8');

if (!html.includes(PLACEHOLDER)) {
  throw new Error(`prerender: ${PLACEHOLDER} not found in dist/index.html`);
}

await writeFile(htmlPath, html.replace(PLACEHOLDER, `<div id="root">${render()}</div>`), 'utf8');
await rm(ssrDir, { recursive: true, force: true });

console.log('prerender: dist/index.html populated');
