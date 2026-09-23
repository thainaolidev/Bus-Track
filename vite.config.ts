import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const CACHE_VERSION = 'bus-track-v1';
const swPlugin = {
  name: 'bus-track-service-worker',
  async closeBundle() {
    const root = resolve('dist');
    const files = await readdir(root, { withFileTypes: true });
    const precache = ['/'];
    for (const item of files) {
      if (!item.isFile() || ['sw.js', 'vercel.json'].includes(item.name)) continue;
      precache.push(`/${item.name}`);
    }
    for (const item of files) {
      if (item.isDirectory() && item.name === 'assets') {
        for (const asset of await readdir(resolve(root, item.name))) precache.push(`/assets/${asset}`);
      }
    }
    const buildId = createHash('sha256').update(precache.sort().join('\n')).digest('hex').slice(0, 10);
    const source = await readFile(resolve('public/sw.js'), 'utf8');
    const output = source.replace('__CACHE_VERSION__', CACHE_VERSION).replace('__BUILD_ID__', buildId).replace('__PRECACHE_URLS__', JSON.stringify(precache));
    await writeFile(resolve(root, 'sw.js'), output);
  }
};
export default defineConfig({ plugins: [swPlugin] });
