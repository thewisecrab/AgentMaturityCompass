import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const HERE = dirname(fileURLToPath(import.meta.url));
const WEBSITE_DIR = resolve(HERE, '../../website');

export const INDEX_URL = `file://${resolve(WEBSITE_DIR, 'index.html')}`;
export const PLAYGROUND_URL = `file://${resolve(WEBSITE_DIR, 'playground.html')}`;
export const LITE_URL = `file://${resolve(WEBSITE_DIR, 'lite.html')}`;
