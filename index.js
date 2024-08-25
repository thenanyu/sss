const fs = require('fs-extra');
const path = require('path');
const marked = require('marked').marked;
const chokidar = require('chokidar');

const pagesDir = path.join(__dirname, 'pages');
const outputDir = path.join(__dirname, 'dist');
const assetsDir = path.join(__dirname, 'assets');
const stylesFile = path.join(__dirname, 'styles.css');

// Ensure output directory exists
fs.ensureDirSync(outputDir);

function copyAssets() {
  fs.copySync(assetsDir, path.join(outputDir, 'assets'));
  fs.copyFileSync(stylesFile, path.join(outputDir, 'styles.css'));
}

function processMarkdownFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const htmlContent = marked(content);

  const relativePath = path.relative(pagesDir, filePath);
  const outputPath = path.join(outputDir, relativePath.replace('.md', '.html'));

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="${path.relative(path.dirname(outputPath), path.join(outputDir, 'styles.css'))}">
        <title>${path.basename(filePath, '.md')}</title>
    </head>
    <body>
        ${htmlContent}
    </body>
    </html>
  `;

  fs.ensureDirSync(path.dirname(outputPath));
  fs.writeFileSync(outputPath, htmlTemplate);
  console.log(`Generated ${outputPath}`);
}

function processAllMarkdownFiles() {
  const processDir = (dir) => {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(dirent => {
      const fullPath = path.join(dir, dirent.name);
      if (dirent.isDirectory()) {
        processDir(fullPath);
      } else if (path.extname(dirent.name) === '.md') {
        processMarkdownFile(fullPath);
      }
    });
  };

  processDir(pagesDir);
}

function compile() {
  console.log('Compiling...');
  copyAssets();
  processAllMarkdownFiles();
  console.log('Compilation complete.');
}

// Initial compilation
compile();

// Watch for changes
const watcher = chokidar.watch([
  path.join(pagesDir, '**', '*.md'),
  stylesFile
], {
  persistent: true,
  ignoreInitial: true
});

watcher
  .on('add', path => {
    console.log(`File ${path} has been added`);
    compile();
  })
  .on('change', path => {
    console.log(`File ${path} has been changed`);
    compile();
  })
  .on('unlink', path => {
    console.log(`File ${path} has been removed`);
    compile();
  });

console.log('Watching for changes...');
