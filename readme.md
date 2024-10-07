# Simple Static Site Generator (SSS)

SSS is a minimal, Node.js-based static site generator that converts Markdown files into HTML pages. It's designed to be extremely simple, fast, and easy to use.

## Features

- Converts Markdown files to HTML
- Supports nested directory structures
- Automatically applies styles from a custom CSS file
- Watches for file changes and recompiles automatically
- Respects system dark mode preferences

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
4. Run the build command:
   ```
   npm run build
   ```

SSS will create HTML files in the `dist` directory and watch for changes in your Markdown files and `styles.css`.

## Project Structure

```
project_root/
├── pages/ # Your Markdown files go here
├── assets/ # Static assets (images, etc.)
├── styles.css # Custom styles
├── dist/ # Generated HTML files (do not edit directly)
├── index.js # Main script
└── package.json
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Credits

Created by Nan Yu using [Cursor](www.cursor.com) and [Claude](https://claude.ai/)
