import esbuild from 'esbuild';
import fs from 'fs-extra';
import path from 'path';
import { rimraf } from 'rimraf';

const outDir = 'docs';
const entryPoint = 'index.tsx'; // Your main application entry point

// External packages (loaded via import map in index.html)
// These should match the keys in your importmap
const externalPackages = [
  'react', 'react-dom',
  '@mui/material', '@mui/icons-material',
  '@emotion/react', '@emotion/styled',
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
  // Also handle relative path (in case it's not absolute)
  indexHtmlContent = indexHtmlContent.replace(
    /<script type="module" src="\.\.?\/index.tsx"><\/script>/,
    '<script type="module" src="./main.js"></script>'
  );
  // Remove any duplicate script tags for index.tsx
  indexHtmlContent = indexHtmlContent.replace(
    /<script type="module" src="index.tsx"><\/script>/g,
    ''
  );

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