import { createRequire } from 'node:module';

import './registerCoreAliases.js';

const require = createRequire(import.meta.url);

export const requireCore = (request) => require(request);
