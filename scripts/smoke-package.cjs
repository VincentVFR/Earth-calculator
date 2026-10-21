const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const installed = process.argv[2] === '--installed';
const prefix = installed ? path.resolve(process.argv[3]) : fs.mkdtempSync(path.join(__dirname, '..', 'build', 'smoke-'));
if (!installed) {
 const archive = path.resolve(process.argv[2]);
 assert(fs.statSync(archive).isFile());
 const args = ['install', '--prefix', prefix, archive, '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false'];
 const env = { ...process.env, npm_config_cache: process.env.npm_config_cache || path.join(prefix, '.npm-cache') };
 if (process.platform === 'win32') {
  const cli = path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');
  assert(fs.existsSync(cli), 'npm CLI must be installed alongside Node.js on Windows');
  execFileSync(process.execPath, [cli, ...args], { stdio: 'pipe', env });
 } else execFileSync('npm', args, { stdio: 'pipe', env });
}
const mod = require(path.join(prefix, 'node_modules', '@vincentvfr', 'globepath-math'));
assert.deepEqual(Object.keys(mod), ['geometry', 'solar']);
assert(Math.abs(mod.geometry.distance([0, 0], [90, 0]) - Math.PI * mod.geometry.R / 2) < 1e-8);
assert.equal(mod.geometry.distance([2.35, 48.86], [2.35, 48.86]), 0);
const result = mod.solar.compare('earth', 'mars', 180);
assert(Math.abs(result.au - 2.524) < 1e-12);
assert.equal(result.lightSeconds, result.km / mod.solar.C_KM_S);
assert.throws(() => mod.solar.compare('earth', 'mars', 181), RangeError);
assert.equal(mod.solar.planets.length, 8);
console.log('Installed package smoke passed: CommonJS exports, geometry, planets, units, validation.');
