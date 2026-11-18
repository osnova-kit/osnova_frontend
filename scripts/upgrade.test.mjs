import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { UpgradeError, keepOurVersions, upgrade } from './upgrade.mjs';

const hasGit = spawnSync('git', ['--version']).status === 0;

const env = {
  ...process.env,
  GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_AUTHOR_NAME: 'Test',
  GIT_AUTHOR_EMAIL: 'test@example.com',
  GIT_COMMITTER_NAME: 'Test',
  GIT_COMMITTER_EMAIL: 'test@example.com',
};

const run = (cwd, ...args) => execFileSync('git', args, { cwd, env, encoding: 'utf8' });

const PACKAGE = (version) =>
  `{\n  "name": "osnova",\n  "version": "${version}",\n  "private": true,\n  "type": "module",\n  "license": "MIT",\n  "description": "Osnova"\n}\n`;
const MAIN = 'export const first = 1;\n\n\n\nexport const second = 2;\n';

function write(root, files) {
  for (const [path, text] of Object.entries(files)) {
    const target = join(root, path);
    if (text === null) {
      rmSync(target);
      continue;
    }
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, text);
  }
}

function release(template, version, files) {
  write(template, { ...files, '.osnova-version': `${version}\n` });
  run(template, 'add', '-A');
  run(template, 'commit', '-q', '-m', `release ${version}`);
  run(template, 'tag', version);
}

function commit(root) {
  run(root, 'add', '-A');
  run(root, 'commit', '-q', '-m', 'project change');
}

const read = (root, path) => readFileSync(join(root, path), 'utf8');

describe.skipIf(!hasGit)('npm run upgrade', () => {
  let dir;
  let template;
  let project;
  const saved = {};

  beforeEach(() => {
    for (const key of Object.keys(env)) saved[key] = process.env[key];
    Object.assign(process.env, env);
    dir = mkdtempSync(join(tmpdir(), 'osnova-upgrade-'));
    template = join(dir, 'template');
    project = join(dir, 'project');
    mkdirSync(template);
    mkdirSync(project);
    run(template, 'init', '-q', '-b', 'main');
    release(template, 'v1.0.0', {
      'src/main.ts': MAIN,
      'src/modules/files/index.ts': 'export const files = 1;\n',
      'e2e/files.e2e.ts': 'files\n',
      'package.json': PACKAGE('1.0.0'),
      'README.md': '# Osnova\n',
      'CHANGELOG.md': '## 1.0.0\n',
    });
    const archive = execFileSync('git', ['archive', 'v1.0.0'], { cwd: template });
    execFileSync('tar', ['-x'], { cwd: project, input: archive });
    run(project, 'init', '-q', '-b', 'main');
    commit(project);
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it('merges the template and the project, a removed module stays removed', () => {
    release(template, 'v1.1.0', {
      'src/main.ts': MAIN.replace('second = 2', 'second = 22'),
      'src/modules/files/index.ts': 'export const files = 2;\n',
      'src/modules/files/size.ts': 'export const size = 1;\n',
      'e2e/files.setup.ts': 'setup\n',
      'src/new.ts': 'export const added = 1;\n',
      'package.json': PACKAGE('1.1.0').replace('"Osnova"', '"Osnova 1.1"'),
      'README.md': '# Osnova 1.1\n',
      'CHANGELOG.md': '## 1.1.0\n## 1.0.0\n',
    });
    rmSync(join(project, 'src/modules/files'), { recursive: true });
    write(project, {
      'e2e/files.e2e.ts': null,
      'src/main.ts': MAIN.replace('first = 1', 'first = 11'),
      'package.json': PACKAGE('2.3.0'),
      'README.md': '# My shop\n',
      'CHANGELOG.md': '## 2.3.0\n',
    });
    commit(project);

    const { start, left } = upgrade(project, 'v1.1.0', template);

    expect(left).toEqual([]);
    expect(run(project, 'rev-parse', 'HEAD').trim()).not.toBe(start);
    expect(run(project, 'status', '--porcelain')).toBe('');
    expect(read(project, 'src/main.ts')).toContain('first = 11');
    expect(read(project, 'src/main.ts')).toContain('second = 22');
    expect(existsSync(join(project, 'src/new.ts'))).toBe(true);
    expect(existsSync(join(project, 'src/modules/files'))).toBe(false);
    expect(existsSync(join(project, 'e2e/files.setup.ts'))).toBe(false);
    expect(read(project, 'package.json')).toBe(
      PACKAGE('2.3.0').replace('"Osnova"', '"Osnova 1.1"'),
    );
    expect(read(project, 'README.md')).toBe('# My shop\n');
    expect(read(project, 'CHANGELOG.md')).toBe('## 2.3.0\n');
    expect(read(project, '.osnova-version')).toBe('v1.1.0\n');
  });

  it('needs no new base for the next upgrade', () => {
    release(template, 'v1.1.0', { 'src/new.ts': 'export const added = 1;\n' });
    upgrade(project, 'v1.1.0', template);
    release(template, 'v1.2.0', { 'src/new.ts': 'export const added = 2;\n' });

    upgrade(project, 'v1.2.0', template);

    expect(read(project, 'src/new.ts')).toBe('export const added = 2;\n');
    const log = run(project, 'log', '--format=%s');
    expect(log.split('as the base for upgrades').length).toBe(2);
    expect(log).toContain('chore: upgrade Osnova to v1.2.0');
  });

  it('leaves a line changed on both sides to resolve', () => {
    release(template, 'v1.1.0', { 'src/main.ts': MAIN.replace('second = 2', 'second = 22') });
    write(project, { 'src/main.ts': MAIN.replace('second = 2', 'second = 33') });
    commit(project);

    const { start, left } = upgrade(project, 'v1.1.0', template);

    expect(left).toEqual(['src/main.ts']);
    expect(read(project, 'src/main.ts')).toContain('<<<<<<<');
    run(project, 'merge', '--abort');
    run(project, 'reset', '-q', '--hard', start);
    expect(read(project, 'src/main.ts')).toContain('second = 33');
  });

  it('refuses a working tree with changes and the same version', () => {
    expect(() => upgrade(project, 'v1.0.0', template)).toThrow('on v1.0.0 already');
    write(project, { 'src/main.ts': 'changed\n' });
    expect(() => upgrade(project, 'v1.1.0', template)).toThrow(UpgradeError);
  });
});

describe('version conflicts', () => {
  it('keep ours only when both sides set just a version', () => {
    const text =
      'a\n<<<<<<< HEAD\n  "version": "2.0",\n=======\n  "version": "1.1",\n>>>>>>> v\nb\n';
    expect(keepOurVersions(text)).toBe('a\n  "version": "2.0",\nb\n');
    const other = '<<<<<<< HEAD\nx = 1\n=======\nx = 2\n>>>>>>> v\n';
    expect(keepOurVersions(other)).toBe(other);
  });
});
