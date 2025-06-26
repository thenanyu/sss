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
  // Only copy assets directory if it exists
  if (fs.existsSync(assetsDir)) {
    fs.copySync(assetsDir, path.join(outputDir, 'assets'));
  }
  fs.copyFileSync(stylesFile, path.join(outputDir, 'styles.css'));
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
        <title>${path.basename(cleanName, '.md')}</title>
        <script>
          // Theme detection and application - runs before page render to prevent flash
          (function() {
            const savedTheme = localStorage.getItem('theme');
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            
            if (savedTheme) {
              document.documentElement.className = 'theme-' + savedTheme;
            } else if (systemPrefersDark) {
              document.documentElement.className = 'theme-dark';
            } else {
              document.documentElement.className = 'theme-light';
            }
          })();
        </script>
    </head>
    <body>
        <!-- Theme toggle button -->
        <button class="theme-toggle" id="theme-toggle" aria-label="Toggle dark mode" title="Toggle theme">
          <span id="theme-icon">🌙</span>
        </button>
        
        ${htmlContent}
        
        <script>
          // Theme toggle functionality
          (function() {
            const toggleButton = document.getElementById('theme-toggle');
            const themeIcon = document.getElementById('theme-icon');
            
            function getCurrentTheme() {
              const savedTheme = localStorage.getItem('theme');
              if (savedTheme) return savedTheme;
              
              return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }
            
            function updateThemeIcon(theme) {
              themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
              toggleButton.setAttribute('aria-label', 
                theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
              );
            }
            
            function setTheme(theme) {
              document.documentElement.className = 'theme-' + theme;
              localStorage.setItem('theme', theme);
              updateThemeIcon(theme);
            }
            
            // Initialize icon based on current theme
            updateThemeIcon(getCurrentTheme());
            
            // Toggle theme on button click
            toggleButton.addEventListener('click', function() {
              const currentTheme = getCurrentTheme();
              const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
              setTheme(newTheme);
            });
            
            // Listen for system theme changes when no manual preference is set
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
              if (!localStorage.getItem('theme')) {
                const newTheme = e.matches ? 'dark' : 'light';
                document.documentElement.className = 'theme-' + newTheme;
                updateThemeIcon(newTheme);
              }
            });
          })();
        </script>
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
