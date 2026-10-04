# Simple Static Site Generator (SSS)

SSS is a minimal, Node.js-based static site generator that converts Markdown files into HTML pages. It's designed to be extremely simple, fast, and easy to use.

## Features

- Converts Markdown files to HTML
- Development mode with file watching and automatic recompilation
- Respects system dark mode preferences
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
   npm ci
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

### Preview

The development command watches files but does not start an HTTP server. To preview a build locally, run:

```
python3 -m http.server 8000 --bind 127.0.0.1 --directory dist
```

Then open <http://127.0.0.1:8000>.

### Publishing thenanyu.com to GitHub Pages

This repository contains the source. The generated site is published from the root of the `main` branch in [thenanyu/thenanyu.github.io](https://github.com/thenanyu/thenanyu.github.io), with `CNAME` set to `thenanyu.com`.

Building requires Node.js and npm, with dependencies installed using `npm ci`. No `.env` file or environment variables are required. Publishing additionally requires Git, a commit author identity, and authenticated write access to both repositories. Restore GitHub authentication separately on a new computer; do not put credentials in this repository.

After reviewing and committing the source changes, build and preview the site. For a deployment that preserves the Pages repository's history, run the following from this repository, using a fresh sibling directory for the Pages checkout:

```sh
TZ=America/New_York npm run build
git clone https://github.com/thenanyu/thenanyu.github.io.git ../sss-pages-publish
git -C ../sss-pages-publish switch main
rsync -a --delete --exclude='.git/' --exclude='CNAME' dist/ ../sss-pages-publish/
printf 'thenanyu.com\n' > ../sss-pages-publish/CNAME
git -C ../sss-pages-publish add -A
git -C ../sss-pages-publish diff --cached --stat
git -C ../sss-pages-publish diff --cached
```

The explicit build timezone preserves the existing RSS article timestamps when building on a computer in another timezone.

Review the generated diff before publishing. Once approved, push the source commit to the source repository's intended branch, then publish the generated site:

```sh
git -C ../sss-pages-publish commit -m "Update personal website"
git -C ../sss-pages-publish push origin main
```

Check the Pages deployment status on GitHub and verify <https://thenanyu.com/> after deployment completes.

The legacy `deploy.sh` also builds and publishes, but it uses SSH and force-pushes a newly initialized repository, replacing the destination history. It also relies on Git's default initial branch being `main`. Prefer the normal commit-and-push flow above when restoring this setup.

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

Created by Nan Yu and his friendly team of AI helpers
