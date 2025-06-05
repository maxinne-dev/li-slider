
# Deploying Slide Creator to GitHub Pages

This document provides instructions for deploying the Slide Creator application to GitHub Pages.

## Overview

We will use:
1.  **`esbuild`**: A fast JavaScript/TypeScript bundler to prepare your application for production.
2.  **GitHub Actions**: To automate the build and deployment process whenever you push changes to your `main` branch.
3.  **GitHub Pages**: To host your static single-page application.

## Setup Instructions

### 1. Create `build.mjs`

This file is a Node.js script that uses `esbuild` to bundle your application.

**Location**: Create this file in the **root** of your project.

**Content for `build.mjs`**:
```javascript
import esbuild from 'esbuild';
import fs from 'fs-extra';
import path from 'path';
import { rimraf } from 'rimraf';

const outDir = 'docs';
const entryPoint = 'index.tsx'; // Your main application entry point

// Get API key from environment variable (set by GitHub Actions)
const apiKey = process.env.GEMINI_API_KEY || '';

// External packages (loaded via import map in index.html)
// These should match the keys in your importmap
const externalPackages = [
  'react', 'react/', 'react-dom/', 
  '@mui/material/', '@mui/icons-material/', 
  '@emotion/react', '@emotion/styled', '@mui/material',
  'blobshape'
];

async function build() {
  console.log(`Cleaning ${outDir} directory...`);
  await rimraf(outDir);
  await fs.ensureDir(outDir);

  console.log('Bundling application with esbuild...');
  try {
    await esbuild.build({
      entryPoints: [entryPoint],
      bundle: true,
      outfile: path.join(outDir, 'main.js'),
      minify: true,
      format: 'esm', // ES module format
      sourcemap: true, // Recommended for debugging, can be 'external' or false
      jsx: 'automatic', // Uses the new JSX transform
      loader: { '.ts': 'tsx', '.tsx': 'tsx' },
      external: externalPackages, // Mark CDN packages as external
      define: {
        'process.env.NODE_ENV': '"production"',
        'process.env.API_KEY': `"${apiKey}"`, // Inject API key
      },
      logLevel: 'info',
    });
    console.log('Application bundled successfully.');
  } catch (error) {
    console.error('esbuild failed:', error);
    process.exit(1);
  }

  console.log(`Copying index.html to ${outDir}...`);
  await fs.copyFile('index.html', path.join(outDir, 'index.html'));

  console.log('Updating script tag in copied index.html...');
  const indexPath = path.join(outDir, 'index.html');
  let indexHtmlContent = await fs.readFile(indexPath, 'utf-8');
  
  // Replace the development script tag with the production one
  indexHtmlContent = indexHtmlContent.replace(
    /<script type="module" src="\/index.tsx"><\/script>/,
    '<script type="module" src="./main.js"></script>'
  );
  // Ensure any other dev-specific paths are handled if necessary

  await fs.writeFile(indexPath, indexHtmlContent);
  console.log('index.html updated.');

  // If you have other static assets (e.g., images in a public folder, favicons), copy them here.
  // For example:
  // if (fs.existsSync('public')) {
  //   console.log('Copying public assets...');
  //   await fs.copy('public', path.join(outDir, 'public'));
  // }

  console.log('Build complete. Output is in the "docs" directory.');
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

### 2. Create GitHub Actions Workflow File

This YAML file defines the automated workflow for building and deploying your application.

**Location**: Create a directory path `.github/workflows/` in your project root. Inside the `workflows` directory, create a file named `deploy.yml`.

**Content for `.github/workflows/deploy.yml`**:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main # Or your default branch
  workflow_dispatch: # Allows manual triggering

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20' # Use a current LTS version
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run typecheck

      - name: Build application
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
        run: npm run build # This executes node build.mjs

      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./docs # The directory containing your built static files

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 3. Update `package.json`

Ensure your `package.json` has the necessary scripts and devDependencies. The `build.mjs` script relies on `esbuild` and `fs-extra`, and `rimraf`. `gh-pages` is listed but the GitHub Action uses a more direct approach for deployment artifacts.

```json
{
  "name": "slide-creator",
  "version": "1.0.0",
  "description": "A web application to create slideshows.",
  "type": "module",
  "scripts": {
    "clean": "rimraf docs",
    "typecheck": "tsc --noEmit",
    "build": "node build.mjs",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d docs"
  },
  "devDependencies": {
    "esbuild": "^0.20.2",
    "fs-extra": "^11.2.0", // Added for more robust file operations
    "gh-pages": "^6.1.1",
    "rimraf": "^5.0.5",
    "typescript": "^5.4.5"
  },
  "dependencies": {
    "@emotion/react": "^11.11.4",
    "@emotion/styled": "^11.11.5",
    "@mui/icons-material": "^5.16.0",
    "@mui/material": "^5.16.0",
    "blobshape": "^1.0.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "homepage": "https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPOSITORY_NAME"
}
```
**Important**:
*   Run `npm install fs-extra --save-dev` if you don't have it.
*   Replace `YOUR_GITHUB_USERNAME` and `YOUR_REPOSITORY_NAME` in the `homepage` field. While the GitHub Action deployment is robust, this field is good practice and used by some tools.

### 4. GitHub Repository Configuration

#### a. Set API Key Secret

The application requires a Gemini API key. This key will be securely passed to the build process using GitHub Secrets.

1.  Go to your GitHub repository.
2.  Click on **Settings**.
3.  In the left sidebar, navigate to **Secrets and variables** -> **Actions**.
4.  Click the **New repository secret** button.
5.  Name the secret: `GEMINI_API_KEY`.
6.  Paste your actual Gemini API key into the "Secret" field.
7.  Click **Add secret**.

**Security Note**: The `build.mjs` script embeds this `GEMINI_API_KEY` directly into the client-side JavaScript bundle as `process.env.API_KEY`. For a truly secret API key, this is a **significant security risk**, as anyone can view the key from your deployed site's source code. This project's constraints require a frontend-only solution with the key managed via `process.env.API_KEY`. If your Gemini API key has strong client-side restrictions (e.g., limited to specific domains), this risk might be somewhat mitigated. Otherwise, for production applications with sensitive keys, a backend proxy is the standard approach to protect the key.

#### b. Configure GitHub Pages Source

The GitHub Actions workflow will build your application and prepare it for GitHub Pages.

1.  Go to your GitHub repository.
2.  Click on **Settings**.
3.  In the left sidebar, navigate to **Pages**.
4.  Under "Build and deployment", for the "Source" option, select **GitHub Actions**. The workflow will handle creating and deploying the artifact.

### 5. Commit and Push

Commit the new files (`build.mjs`, `.github/workflows/deploy.yml`) and any changes to `package.json` and `DEPLOY.md` to your repository:

```bash
git add build.mjs .github/workflows/deploy.yml package.json DEPLOY.md
git commit -m "feat: Add build script and GitHub Actions workflow for deployment"
git push origin main
```

## Deployment Process

1.  **Push to `main` branch**: When you push changes to your `main` branch (or the branch specified in `deploy.yml`), the GitHub Action will automatically trigger.
2.  **GitHub Action Execution**: The workflow will:
    *   Check out your code.
    *   Set up Node.js.
    *   Install dependencies.
    *   Run a type check.
    *   Build the application using `npm run build` (which runs `node build.mjs`). The `GEMINI_API_KEY` secret is made available as an environment variable to this build script.
    *   Upload the built `docs` directory as a Pages artifact.
    *   Deploy the artifact to GitHub Pages.
3.  **Accessing Your Site**: After the workflow completes successfully (it might take a few minutes the first time), your application will be available at:
    `https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPOSITORY_NAME/`

## Local Build (for testing)

To test the build process locally:

1.  Set the API key as an environment variable (optional, for testing API key injection):
    ```bash
    export GEMINI_API_KEY="your_test_api_key_here" 
    # For Windows (Command Prompt): set GEMINI_API_KEY="your_test_api_key_here"
    # For Windows (PowerShell): $env:GEMINI_API_KEY="your_test_api_key_here"
    ```
2.  Run the build script:
    ```bash
    npm run build
    ```
    This will create the `docs` folder with the bundled application. You can then serve the `docs` folder with a local static server to test it.

This setup should provide a robust way to build and deploy your Slide Creator application. Remember to review the API key security implications.
```