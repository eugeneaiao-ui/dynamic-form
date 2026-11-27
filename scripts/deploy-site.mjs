import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, realpathSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const remote = execFileSync('git', ['remote', 'get-url', 'origin'], { encoding: 'utf8' }).trim();
assert.equal(
  remote,
  'https://github.com/eugeneaiao-ui/formino.git',
  'Confirm the intended repository before deployment.',
);
const gitEnvironment = { ...process.env };
const inActions = process.env.GITHUB_ACTIONS === 'true';
if (inActions) {
  assert(process.env.GITHUB_TOKEN, 'GitHub Actions requires its repository token.');
  gitEnvironment.GIT_CONFIG_COUNT = '1';
  gitEnvironment.GIT_CONFIG_KEY_0 = 'http.https://github.com/.extraheader';
  gitEnvironment.GIT_CONFIG_VALUE_0 =
    'AUTHORIZATION: basic ' + Buffer.from('x-access-token:' + process.env.GITHUB_TOKEN).toString('base64');
}
let changed = false;
const temporaryRoot = realpathSync(os.tmpdir());
const directory = mkdtempSync(path.join(temporaryRoot, 'formino-pages-'));
assert.equal(path.dirname(realpathSync(directory)).toLowerCase(), temporaryRoot.toLowerCase());
assert(path.basename(directory).startsWith('formino-pages-'));
const run = (args) => execFileSync('git', args, { cwd: directory, stdio: 'inherit', env: gitEnvironment });
try {
  const branch = execFileSync('git', ['ls-remote', '--heads', remote, 'gh-pages'], {
    encoding: 'utf8',
    env: gitEnvironment,
  }).trim();
  if (branch) {
    run(['init']);
    run(['remote', 'add', 'origin', remote]);
    run(['fetch', '--depth=1', 'origin', 'gh-pages']);
    run(['checkout', '-b', 'gh-pages', 'FETCH_HEAD']);
    run(['rm', '-r', '--ignore-unmatch', '.']);
  } else {
    run(['init', '--initial-branch=gh-pages']);
    run(['remote', 'add', 'origin', remote]);
  }
  cpSync(path.resolve('site-dist'), directory, { recursive: true });
  run(['add', '--all']);
  const changes = execFileSync('git', ['status', '--porcelain'], { cwd: directory, encoding: 'utf8' }).trim();
  if (!changes) {
    console.log('Pages content is already current.');
  } else {
    run([
      '-c',
      inActions ? 'user.name=github-actions[bot]' : 'user.name=eugeneaiao-ui',
      '-c',
      inActions
        ? 'user.email=41898282+github-actions[bot]@users.noreply.github.com'
        : 'user.email=237674325+eugeneaiao-ui@users.noreply.github.com',
      'commit',
      '-m',
      'Publish Formino documentation and playground',
    ]);
    run(['push', 'origin', 'HEAD:refs/heads/gh-pages']);
    changed = true;
  }
  if (changed && inActions) {
    const response = await fetch('https://api.github.com/repos/eugeneaiao-ui/formino/pages/builds', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + process.env.GITHUB_TOKEN,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'formino-pages',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    assert(response.ok, 'Pages rebuild request returned HTTP ' + response.status);
    console.log('Requested a Pages rebuild after the source-branch update.');
  }
} finally {
  const target = realpathSync(directory);
  assert.equal(path.dirname(target).toLowerCase(), temporaryRoot.toLowerCase());
  assert(path.basename(target).startsWith('formino-pages-'));
  rmSync(target, { recursive: true, force: true });
}
