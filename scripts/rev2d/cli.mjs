// Rev2D CLI 래퍼: `node scripts/rev2d/cli.mjs avatar build art/jiny` 처럼 rev2d 대신 쓴다.
// 생성 일러스트는 불투명 픽셀 알파가 ~252 라 머리카락 마스크 임계값만 240 으로 낮춘다(체크아웃은 수정하지 않음).
// Rev2D 위치: REV2D_ROOT, 기본은 바탕화면 Rev2D-main
import { homedir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const root = process.env.REV2D_ROOT ?? join(homedir(), 'Desktop', 'Rev2D-main');
const file = (p) => pathToFileURL(join(root, p)).href;
const { register } = await import(file('node_modules/tsx/dist/esm/api/index.mjs'));
register({ tsconfig: join(root, 'tsconfig.json') });
const { HAIR_MASK_TUNING } = await import(file('src/avatar/features/hair-mask.ts'));
HAIR_MASK_TUNING.opaque = 240;
const { runCli } = await import(file('src/cli/main.ts'));
await runCli(process.argv.slice(2));
