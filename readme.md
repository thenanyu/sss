# Simple Static Site Generator (SSS)

SSS is a minimal, Node.js-based static site generator that converts Markdown files into HTML pages. It's designed to be extremely simple, fast, and easy to use.

## Features

- Converts Markdown files to HTML
- Development mode with file watching and automatic recompilation
- **Automatic dark mode** - Respects system dark mode preferences via CSS `@media (prefers-color-scheme: dark)` (no JavaScript toggle needed)
- RSS feed generation
- Custom markdown extensions (definition lists, tweet embeds, footnotes)

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/thenanyu/sss.git
   cd sss
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Usage

1. Place your Markdown files in the `pages` directory.
2. Put your assets (images, etc.) in the `assets` directory.
3. Customize the `styles.css` file for your design preferences.

### Development

For development with automatic file watching and recompilation:
```
npm run dev
```

This will build your site and watch for changes in Markdown files, JavaScript files, and `styles.css`, automatically rebuilding when changes are detected.

### Production Build

For a one-time build (useful for deployment):
```
npm run build
```

This will generate HTML files in the `dist` directory without starting the file watcher.

### Creating New Entries

To create a new blog entry or page:
```
npm run new
```

This will help you create a new Markdown file with the proper naming convention.

## Project Structure

```
project_root/
├── pages/ # Your Markdown files go here
│   ├── writing/ # Blog posts with date-based naming
│   └── index.md # Main page
├── assets/ # Static assets (images, etc.)
├── styles.css # Custom styles
├── dist/ # Generated HTML files (do not edit directly)
├── build.js # Build script (production)
├── dev.js # Development script (build + watch)
├── watcher.js # File watching functionality
├── new-post.js # Script for creating new entries
└── package.json
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Credits

Created by Nan Yu using [Cursor](www.cursor.com) and [Claude](https://claude.ai/)
