import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, posix } from 'node:path';

import { ROOT } from './strip.mjs';

export const UPSTREAM = 'https://github.com/osnova-kit/osnova_frontend.git';
const VERSION_FILE = '.osnova-version';
const OURS = new Set(['CHANGELOG.md', 'README.md']);
const LOCK = 'package-lock.json';

const VERSION_LINE = /^\s*"?version"?\s*[:=]/i;
const CONFLICT = /<<<<<<< [^\n]*\n([\s\S]*?)=======\n([\s\S]*?)>>>>>>> [^\n]*\n/g;
const UNMERGED = new Set(['DD', 'AU', 'UD', 'UA', 'DU', 'AA', 'UU']);

export class UpgradeError extends Error {}

function git(root, args, { check = true } = {}) {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  if (result.error) throw new UpgradeError(`git is needed: ${result.error.message}`);
  if (check && result.status !== 0) {
    throw new UpgradeError(`git ${args.join(' ')}: ${result.stderr.trim()}`);
  }
  return result.stdout;
}

const releaseRef = (version) => `refs/osnova/${version}`;

const filesAt = (root, rev) =>
  new Set(git(root, ['ls-tree', '-r', '--name-only', rev]).split('\n').filter(Boolean));

function parents(path) {
  const found = [];
  for (let dir = posix.dirname(path); dir !== '.'; dir = posix.dirname(dir)) found.push(dir);
  return found;
}

/** Folders that held files in the base release and hold none in the project. */
export function removedDirs(base, head) {
  const kept = new Set([...head].flatMap(parents));
  return new Set([...base].flatMap(parents).filter((dir) => !kept.has(dir)));
}

const modulesIn = (files) =>
  new Set([...files].map((path) => path.match(/^src\/modules\/([^/]+)\//)?.[1]).filter(Boolean));

/** Resolves the conflicts where both sides only set a version, in favour of ours. */
export function keepOurVersions(text) {
  return text.replace(CONFLICT, (whole, ours, theirs) => {
    const lines = [...ours.split('\n'), ...theirs.split('\n')].filter(Boolean);
    const both = ours.trim() && theirs.trim();
    return both && lines.every((line) => VERSION_LINE.test(line)) ? ours : whole;
  });
}

function unmerged(root) {
  const status = git(root, ['status', '--porcelain', '--untracked-files=no']);
  return new Map(
    status
      .split('\n')
      .filter((line) => UNMERGED.has(line.slice(0, 2)))
      .map((line) => [line.slice(3), line.slice(0, 2)]),
  );
}

/**
 * Merges `version` of the template into the project. Returns the commit to go back to
 * and the files left in conflict (the merge is then not committed).
 */
export function upgrade(root, version, upstream = UPSTREAM, { npm = 'npm' } = {}) {
  if (git(root, ['status', '--porcelain'])) {
    throw new UpgradeError('The git working tree has changes: commit them first.');
  }
  const versionFile = join(root, VERSION_FILE);
  if (!existsSync(versionFile)) {
    throw new UpgradeError(
      `No ${VERSION_FILE}: write the release the project was made from into it, e.g. v1.0.0`,
    );
  }
  const base = readFileSync(versionFile, 'utf8').trim();
  if (base === version) throw new UpgradeError(`The project is on ${version} already.`);
  const start = git(root, ['rev-parse', 'HEAD']).trim();
  git(root, [
    'fetch',
    '--no-tags',
    upstream,
    ...[base, version].map((tag) => `+refs/tags/${tag}:${releaseRef(tag)}`),
  ]);

  const headFiles = filesAt(root, 'HEAD');
  const baseFiles = filesAt(root, releaseRef(base));
  const goneDirs = removedDirs(baseFiles, headFiles);
  const headModules = modulesIn(headFiles);
  const goneModules = [...modulesIn(baseFiles)].filter((name) => !headModules.has(name));

  if (!git(root, ['merge-base', 'HEAD', releaseRef(version)], { check: false }).trim()) {
    git(root, [
      'merge',
      '-s',
      'ours',
      '--allow-unrelated-histories',
      '-m',
      `chore: Osnova ${base} as the base for upgrades`,
      releaseRef(base),
    ]);
  }
  git(root, ['merge', '--no-ff', '--no-commit', releaseRef(version)], { check: false });

  for (const [path, code] of unmerged(root)) {
    if (code === 'DU') {
      git(root, ['rm', '-q', '--', path]);
    } else if (OURS.has(path)) {
      git(root, ['checkout', '--ours', '--', path]);
      git(root, ['add', '--', path]);
    } else if (code === 'UU' && path !== LOCK) {
      const file = join(root, path);
      const text = keepOurVersions(readFileSync(file, 'utf8'));
      writeFileSync(file, text);
      if (!text.match(CONFLICT)) git(root, ['add', '--', path]);
    }
  }

  const added = git(root, ['ls-files'])
    .split('\n')
    .filter((path) => path && !headFiles.has(path));
  for (const path of added) {
    const inside = [...goneDirs].some((dir) => path.startsWith(`${dir}/`));
    const e2e = goneModules.some((name) => path.startsWith(`e2e/${name}.`));
    if (inside || e2e) git(root, ['rm', '-q', '-f', '--', path]);
  }

  const left = unmerged(root);
  if (left.has(LOCK) && !left.has('package.json')) {
    git(root, ['checkout', '--theirs', '--', LOCK]);
    try {
      execFileSync(npm, ['install', '--package-lock-only', '--ignore-scripts'], {
        cwd: root,
        stdio: 'ignore',
      });
      git(root, ['add', '--', LOCK]);
      left.delete(LOCK);
    } catch {
      console.log(`${LOCK}: run npm install to write it again from package.json`);
    }
  }
  if (left.size) return { start, left: [...left.keys()].sort() };
  writeFileSync(versionFile, `${version}\n`);
  git(root, ['add', VERSION_FILE]);
  git(root, ['commit', '-q', '--no-edit', '-m', `chore: upgrade Osnova to ${version}`]);
  return { start, left: [] };
}

function main(argv) {
  const upstreamAt = argv.indexOf('--upstream');
  const upstream = upstreamAt === -1 ? UPSTREAM : argv[upstreamAt + 1];
  const skip = upstreamAt === -1 ? -1 : upstreamAt + 1;
  const version = argv.find((arg, index) => !arg.startsWith('--') && index !== skip);
  if (!version) {
    console.log('Name the release: npm run upgrade -- v1.1.0 [--upstream <git address>]');
    return 1;
  }
  let result;
  try {
    result = upgrade(ROOT, version, upstream);
  } catch (error) {
    if (!(error instanceof UpgradeError)) throw error;
    console.log(error.message);
    return 1;
  }
  if (result.left.length) {
    console.log('Both the project and the template changed these files:');
    for (const path of result.left) console.log(`  ${path}`);
    console.log('\nResolve the conflicts, then: git add <files> && git commit');
    console.log(`To give up: git merge --abort && git reset --hard ${result.start}`);
    return 1;
  }
  console.log(`Upgraded to ${version}. Check with npm run lint, npm run typecheck, npm test.`);
  console.log(`To undo: git reset --hard ${result.start}`);
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = main(process.argv.slice(2));
}
