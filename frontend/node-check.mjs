import fs from 'fs';
import path from 'path';

function walk(dir, cb) {
  fs.readdirSync(dir).forEach(f => {
    const fp = path.join(dir, f);
    if (fs.statSync(fp).isDirectory()) {
      if (f !== 'node_modules') walk(fp, cb);
    } else if (/\.(js|jsx)$/.test(f)) {
      cb(fp);
    }
  });
}

const importRegex = /from\s+['"](\.[^'"]+)['"]/g;

walk('src', (file) => {
  const content = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = importRegex.exec(content)) !== null) {
    const importPath = m[1];
    const resolved = path.resolve(path.dirname(file), importPath);
    const dir = path.dirname(resolved);
    const base = path.basename(resolved);
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir);
    const exact = files.some(f => path.parse(f).name === base || f === base);
    const ci = files.some(f => path.parse(f).name.toLowerCase() === base.toLowerCase() || f.toLowerCase() === base.toLowerCase());
    if (!exact && ci) {
      const real = files.find(f => path.parse(f).name.toLowerCase() === base.toLowerCase() || f.toLowerCase() === base.toLowerCase());
      console.log(file + ' -> imports "' + importPath + '" but real file is "' + real + '"');
    }
  }
});

console.log('Scan complete.');