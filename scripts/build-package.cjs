const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'build', 'math');
fs.mkdirSync(out, { recursive: true });
for (const [source, target] of [
 ['packages/math/package.json', 'package.json'], ['packages/math/index.cjs', 'index.cjs'],
 ['packages/math/README.md', 'README.md'], ['geometry.js', 'geometry.js'],
 ['solar.js', 'solar.js'], ['LICENSE', 'LICENSE']
]) fs.writeFileSync(path.join(out, target), fs.readFileSync(path.join(root, source), 'utf8').replace(/\r\n/g, '\n'));
console.log('Built six allowlisted package files in build/math.');
