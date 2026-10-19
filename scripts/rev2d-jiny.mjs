import { homedir } from 'node:os';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
const root = resolve(process.env.REV2D_ROOT || join(homedir(),'Desktop','Rev2D-main'));
const file = path => pathToFileURL(join(root,path)).href;
const { register } = await import(file('node_modules/tsx/dist/esm/api/index.mjs'));
register({tsconfig:join(root,'tsconfig.json')});
const { HAIR_MASK_TUNING } = await import(file('src/avatar/features/hair-mask.ts'));
// Generated art has nearly-opaque skin pixels around alpha 252.
// Lower the skin sampling threshold without changing the external Rev2D checkout.
HAIR_MASK_TUNING.opaque = 240;
const { runCli } = await import(file('src/cli/main.ts'));
await runCli(process.argv.slice(2));
