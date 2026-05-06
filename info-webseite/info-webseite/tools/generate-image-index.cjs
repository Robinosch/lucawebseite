const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const imagesRoot = path.join(projectRoot, 'public', 'images');
const dataDir = path.join(projectRoot, 'public', 'data', 'animals');
const outputPath = path.join(dataDir, 'image-index.json');

function toPosixPath(value) {
  return value.split(path.sep).join('/');
}

function walkDir(dirPath, onFile) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, onFile);
    } else if (entry.isFile()) {
      onFile(fullPath);
    }
  }
}

if (!fs.existsSync(imagesRoot)) {
  console.error('Images root not found:', imagesRoot);
  process.exit(1);
}

const index = {};
walkDir(imagesRoot, filePath => {
  const relativeDir = path.relative(imagesRoot, path.dirname(filePath));
  if (!relativeDir) {
    return;
  }
  const key = `/images/${toPosixPath(relativeDir)}`;
  if (!index[key]) {
    index[key] = [];
  }
  index[key].push(path.basename(filePath));
});

fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(index, null, 2), 'utf8');
console.log('image-index.json generated:', outputPath);

