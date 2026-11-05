// Stages extension files per target (chromium, firefox) into dist/ and zips them; needs the system `zip`.
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const FILES = ['icons', 'src', 'LICENSE'];
const GECKO_ID = 'brewpage-publisher@brewpage.app';
const base = JSON.parse(readFileSync('manifest.json', 'utf8'));

export function manifestFor(target) {
  if (target === 'chromium') return base;
  if (target !== 'firefox') throw new Error(`Unknown target ${target}`);
  return {
    ...base,
    background: { scripts: [base.background.service_worker], type: 'module' },
    browser_specific_settings: {
      gecko: {
        id: GECKO_ID,
        strict_min_version: '140.0',
        data_collection_permissions: { required: ['websiteContent'] },
      },
      gecko_android: { strict_min_version: '142.0' },
    },
  };
}

function stage(target) {
  const dir = join('dist', target);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  for (const file of FILES) cpSync(file, join(dir, file), { recursive: true });
  writeFileSync(join(dir, 'manifest.json'), `${JSON.stringify(manifestFor(target), null, 2)}\n`);
  const zip = `brewpage-publisher-${target}-${base.version}.zip`;
  rmSync(join('dist', zip), { force: true });
  execFileSync('zip', ['-X', '-q', '-r', join('..', zip), '.', '-x', '.*', '*/.*'], { cwd: dir });
  return join('dist', zip);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  for (const target of process.argv.slice(2).length ? process.argv.slice(2) : ['chromium', 'firefox']) {
    console.log(stage(target));
  }
}
