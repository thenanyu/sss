const fs = require('fs-extra');
const path = require('path');
const { marked } = require('marked');
const chokidar = require('chokidar');
const footnote = require('marked-footnote');
const definitionList = require('./marked-definition-list');

const pagesDir = path.join(__dirname, 'pages');
const outputDir = path.join(__dirname, 'dist');
const assetsDir = path.join(__dirname, 'assets');
const stylesFile = path.join(__dirname, 'styles.css');
const themeToggleFile = path.join(__dirname, 'theme-toggle.js');

// Configure marked with extensions
marked.use({ extensions: [definitionList] });
marked.use(footnote());
marked.use({
  gfm: true,
  breaks: true
});

// Ensure output directory exists
fs.ensureDirSync(outputDir);

function copyAssets() {
  // Copy assets directory if it exists
  if (fs.existsSync(assetsDir)) {
    fs.copySync(assetsDir, path.join(outputDir, 'assets'));
  }
  
  // Copy CSS and JavaScript files
  fs.copyFileSync(stylesFile, path.join(outputDir, 'styles.css'));
  fs.copyFileSync(themeToggleFile, path.join(outputDir, 'theme-toggle.js'));
}

function processMarkdownFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Replace {{YEAR}} with current year
  content = content.replace(/{{YEAR}}/g, new Date().getFullYear());

  const htmlContent = marked(content);

  // Get the basename and strip out the date if it exists
  const basename = path.basename(filePath);
  const cleanName = basename.replace(/^\d{4}-\d{2}-\d{2}-(.+)\.md$/, '$1.md');
  const outputPath = path.join(outputDir, cleanName.replace('.md', '.html'));

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="styles.css">
        
        <!-- FOUC Prevention: Apply saved theme before page renders -->
        <script>
        (function() {
          try {
            const theme = localStorage.getItem('theme-preference');
            if (theme && theme !== 'auto') {
              document.documentElement.classList.add('theme-' + theme);
            }
          } catch (e) {
            // Fail silently if localStorage unavailable
          }
        })();
        </script>
        
        <title>${path.basename(cleanName, '.md')}</title>
    </head>
    <body>
        <!-- Theme Toggle Button -->
        <button id="theme-toggle" aria-label="Toggle theme" title="Auto (follows system)">🌓</button>
        
        ${htmlContent}
        
        <!-- Theme Toggle Module -->
        <script src="theme-toggle.js"></script>
    </body>
    </html>
  `;

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

  // Clean the distribution directory first
  fs.emptyDirSync(outputDir);

  copyAssets();
  processAllMarkdownFiles();
  console.log('Compilation complete.');
}

// Initial compilation
compile();

// Watch for changes
const watcher = chokidar.watch([
  path.join(pagesDir, '**', '*.md'),
  stylesFile,
  themeToggleFile
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
