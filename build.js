const fs = require('fs-extra');
const path = require('path');
const { marked } = require('marked');
const footnote = require('marked-footnote');
const definitionList = require('./marked-definition-list');
const tweetExtension = require('./marked-tweet');
const { startWatcher } = require('./watcher');
const RSS = require('rss');

const pagesDir = path.join(__dirname, 'pages');
const outputDir = path.join(__dirname, 'dist');
const assetsDir = path.join(__dirname, 'assets');
const stylesFile = path.join(__dirname, 'styles.css');

// Configure marked with extensions
marked.use({ extensions: [definitionList, tweetExtension] });
marked.use(footnote());
marked.use({
  gfm: true,
  breaks: true
});

// Add custom image renderer to include title attributes
marked.use({
  renderer: {
    image(token) {
      // In marked v14, the renderer receives a token object
      const href = token.href;
      const title = token.title;
      const text = token.text;

      // Use alt text as title if no title is provided
      const titleAttr = title || text;
      return `<img src="${href}" alt="${text}"${titleAttr ? ` title="${titleAttr}"` : ''}>`;
    }
  }
});

// Ensure output directory exists
fs.ensureDirSync(outputDir);

function copyAssets() {
  fs.copySync(assetsDir, path.join(outputDir, 'assets'));
  fs.copyFileSync(stylesFile, path.join(outputDir, 'styles.css'));

  // Copy favicons if the directory exists
  const faviconsDir = path.join(__dirname, 'favicons');
  if (fs.existsSync(faviconsDir)) {
    const faviconFiles = fs.readdirSync(faviconsDir);
    faviconFiles.forEach(file => {
      fs.copyFileSync(path.join(faviconsDir, file), path.join(outputDir, file));
    });
    console.log('Copied favicon files');
  }
}

function processMarkdownFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Get the basename and parse date if it exists
  const basename = path.basename(filePath);
  const dateMatch = basename.match(/^(\d{4})-(\d{2})-\d{2}-/);

  if (dateMatch) {
    const [year, monthNum] = dateMatch.slice(1);
    const date = new Date(year, parseInt(monthNum) - 1);
    const monthName = date.toLocaleString('en-US', { month: 'short' });
    const formattedDate = `*${monthName} ${year}*`;
    content = content.replace(/{{date}}/g, formattedDate);
  }

  // Replace {{YEAR}} with current year
  const currentYear = new Date().getFullYear();
  content = content.replace(/{{YEAR}}/g, currentYear);

  // Clean filename for output
  const cleanName = basename.replace(/^\d{4}-\d{2}-\d{2}-(.+)\.md$/, '$1.md');
  const isIndex = cleanName.toLowerCase() === 'index.md';

  // Extract title and description from content
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : path.basename(cleanName, '.md');

  // Find first block-level element after the title
  const contentAfterTitle = content.slice(content.indexOf(title) + title.length);
  const firstBlockMatch = contentAfterTitle.match(/^>[ \t]*([^\n]+)/m);
  const description = firstBlockMatch ? firstBlockMatch[1].trim() : '';
  console.log(`Extracted description for ${cleanName}: "${description}"`);

  // Extract first image from content
  const imageMatch = content.match(/!\[.*?\]\((.*?)\)/);
  const imageUrl = imageMatch ? `https://thenanyu.com/${imageMatch[1]}` : '';

  // If this is the index file, replace the writing template variable
  if (isIndex) {
    const writingEntries = generateWritingEntries();
    content = content.replace(/{{writing}}/g, writingEntries);
  }

  // Add home link and copyright footer for non-index files in web output
  let webContent = content;
  if (!isIndex) {
    webContent = '[← Home](index.html)\n\n' + webContent;
    webContent += `\n\n<div class="footnotes">\n<p>© Nan Yu – ${currentYear}</p>\n</div>`;
  }

  const htmlContent = marked(webContent);
  const outputPath = path.join(outputDir, cleanName.replace('.md', '.html'));

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <!-- Favicons -->
        <link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">
        <link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png">
        <link rel="manifest" href="site.webmanifest">
        <link rel="shortcut icon" href="favicon.ico">
        <meta name="msapplication-TileColor" content="#ffffff">
        <meta name="msapplication-config" content="browserconfig.xml">
        <meta name="theme-color" content="#ffffff">

        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="article">
        <meta property="og:title" content="${title}">
        <meta property="og:description" content="${description}">
        <meta property="og:url" content="https://thenanyu.com/${cleanName.replace('.md', '.html')}">
        ${imageUrl ? `<meta property="og:image" content="${imageUrl}">` : ''}

        <!-- Twitter -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${title}">
        <meta name="twitter:description" content="${description}">
        ${imageUrl ? `<meta name="twitter:image" content="${imageUrl}">` : ''}

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;1,400;1,600&family=Spectral:ital,wght@0,400;0,600;1,400;1,600&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="styles.css?v=${Date.now()}">
        <title>${title}</title>
        <!-- Cloudflare Web Analytics -->
        <script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "319d6ec648d04e29ba33fca61256833f"}'></script>
        <!-- End Cloudflare Web Analytics -->
    </head>
    <body>
        <div class="theme-toggle">
            <a href="#" id="theme-toggle-link">Switch to dark mode</a>
        </div>
        ${htmlContent}
        <script>
            // Theme toggle functionality
            (function() {
                const toggleLink = document.getElementById('theme-toggle-link');
                const rootElement = document.documentElement;
                const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
                
                // Check for saved theme preference or use the system preference
                const savedTheme = localStorage.getItem('theme');
                
                // Apply the saved theme if it exists
                if (savedTheme === 'dark') {
                    rootElement.classList.add('dark-theme');
                    toggleLink.textContent = 'Switch to light mode';
                } else if (savedTheme === 'light') {
                    rootElement.classList.add('light-theme');
                    toggleLink.textContent = 'Switch to dark mode';
                } else {
                    // No saved preference, set the text based on system preference
                    toggleLink.textContent = prefersDarkScheme.matches ? 
                        'Switch to light mode' : 'Switch to dark mode';
                }
                
                // Toggle theme when the link is clicked
                toggleLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    if (rootElement.classList.contains('dark-theme')) {
                        // Switch to light theme
                        rootElement.classList.remove('dark-theme');
                        rootElement.classList.add('light-theme');
                        toggleLink.textContent = 'Switch to dark mode';
                        localStorage.setItem('theme', 'light');
                    } else if (rootElement.classList.contains('light-theme')) {
                        // Switch to system preference
                        rootElement.classList.remove('light-theme');
                        rootElement.classList.remove('dark-theme');
                        toggleLink.textContent = prefersDarkScheme.matches ? 
                            'Switch to light mode' : 'Switch to dark mode';
                        localStorage.removeItem('theme');
                    } else {
                        // Switch to dark theme
                        rootElement.classList.add('dark-theme');
                        rootElement.classList.remove('light-theme');
                        toggleLink.textContent = 'Switch to light mode';
                        localStorage.setItem('theme', 'dark');
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

// Function to process markdown files and return structured data
function processMarkdownFiles() {
  const writingDir = path.join(pagesDir, 'writing');

  // Check if the writing directory exists
  if (!fs.existsSync(writingDir)) {
    return [];
  }

  // Get all markdown files in the writing directory
  return fs.readdirSync(writingDir)
    .filter(file => file.endsWith('.md'))
    .map(file => {
      const filePath = path.join(writingDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Extract title from the first line (assuming it's a heading)
      const titleMatch = content.match(/^#\s+(.*?)(?:\n|$)/);
      const title = titleMatch ? titleMatch[1].trim() : path.basename(file, '.md');

      // Extract date from filename
      const dateMatch = file.match(/^(\d{4})-(\d{2})-(\d{2})-/);
      let date = '*Coming soon*';
      let dateObj = null;

      if (dateMatch) {
        const [year, monthNum, dayNum] = dateMatch.slice(1);
        dateObj = new Date(year, parseInt(monthNum) - 1, parseInt(dayNum));
        const monthName = dateObj.toLocaleString('en-US', { month: 'short' });
        date = `*${monthName} ${year}*`;
      }

      // Extract description from the blockquote
      const descMatch = content.match(/^#.*?\n>\s*(.*?)(?:\n|$)/s);
      const description = descMatch ? descMatch[1].trim() : '';

      // Clean filename for output
      const cleanName = file.replace(/^\d{4}-\d{2}-\d{2}-(.+)\.md$/, '$1');
      const url = `https://thenanyu.com/${cleanName}.html`;

      // Convert markdown content to HTML
      const htmlContent = marked(content);

      return {
        title,
        date,
        dateObj,
        description,
        filename: cleanName,
        url,
        content,
        htmlContent
      };
    })
    .sort((a, b) => {
      // Sort by date (newest first)
      // If date is "Coming soon", put it at the end
      if (!a.dateObj) return 1;
      if (!b.dateObj) return -1;
      return b.dateObj.getTime() - a.dateObj.getTime();
    });
}

// Function to generate the writing entries
function generateWritingEntries() {
  const files = processMarkdownFiles();

  if (files.length === 0) {
    return 'No writing entries found.\n\n';
  }

  return files.map(file => {
    // Handle missing descriptions
    const description = file.description || 'No description available';
    return `[${file.title}](${file.filename}.html)\n: ${file.date} — ${description}\n\n`;
  }).join('');
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

function generateRSSFeed() {
  const feed = new RSS({
    title: 'Nan Yu',
    description: 'Thoughts on technology, design, product, and the world we live in',
    feed_url: 'https://thenanyu.com/feed.xml',
    site_url: 'https://thenanyu.com',
    image_url: 'https://thenanyu.com/assets/images/profile.jpeg',
    copyright: `${new Date().getFullYear()} Nan Yu`,
    language: 'en',
    pubDate: new Date().toUTCString(),
    ttl: '60',
    custom_namespaces: {
      'content': 'http://purl.org/rss/1.0/modules/content/',
      'dc': 'http://purl.org/dc/elements/1.1/'
    }
  });

  const files = processMarkdownFiles();

  files.forEach(file => {
    // Process {{date}} variables in the content
    let processedContent = file.content;
    if (file.dateObj) {
      const monthName = file.dateObj.toLocaleString('en-US', { month: 'short' });
      const year = file.dateObj.getFullYear();
      const formattedDate = `*${monthName} ${year}*`;
      processedContent = processedContent.replace(/{{date}}/g, formattedDate);
    }

    // Remove the first H1 heading from content for RSS feed
    processedContent = processedContent.replace(/^#\s+.*?(\n|$)/, '');

    // Convert markdown to HTML
    let htmlContent = marked(processedContent);

    // Make all URLs absolute
    htmlContent = htmlContent.replace(
      /(src|href)="(?!https?:\/\/)([^"]+)"/g,
      (match, attr, url) => `${attr}="https://thenanyu.com/${url}"`
    );

    // Clean up any HTML entities in the title
    const cleanTitle = file.title.replace(/&nbsp;/g, ' ');

    feed.item({
      title: cleanTitle,
      description: file.description,
      url: file.url,
      date: file.dateObj || new Date(),
      guid: file.url,
      custom_elements: [
        { 'content:encoded': { _cdata: htmlContent } },
        { 'dc:creator': 'Nan Yu' }
      ]
    });
  });

  // Write the feed
  const feedPath = path.join(outputDir, 'feed.xml');
  fs.writeFileSync(feedPath, feed.xml({ indent: true }));
  console.log(`Generated RSS feed at: ${feedPath}`);
}

function compile() {
  console.log('Compiling...');

  // Clean the distribution directory first
  fs.emptyDirSync(outputDir);

  copyAssets();
  processAllMarkdownFiles();
  generateRSSFeed();
  console.log('Compilation complete.');
}

// Initial compilation
compile();

// Remove the automatic watcher startup - this is now build-only

module.exports = { compile };
