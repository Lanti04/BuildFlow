// Post-build script to copy asset references from index.html to 404.html
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const distDir = join(process.cwd(), 'dist');
const indexHtml = readFileSync(join(distDir, 'index.html'), 'utf-8');
const html404 = readFileSync(join(distDir, '404.html'), 'utf-8');

// Extract all script and link tags from index.html (for assets)
const scriptMatches = indexHtml.matchAll(/<script[^>]*src="[^"]+assets[^"]+"[^>]*><\/script>/g);
const linkMatches = indexHtml.matchAll(/<link[^>]*href="[^"]+assets[^"]+"[^>]*>/g);

const scriptTags = Array.from(scriptMatches).map(m => m[0]);
const linkTags = Array.from(linkMatches).map(m => m[0]);

if (scriptTags.length > 0 || linkTags.length > 0) {
  // Remove old script and link tags from 404.html
  let updated404 = html404.replace(/<script[^>]*src="[^"]*"[^>]*><\/script>/g, '');
  updated404 = updated404.replace(/<link[^>]*href="[^"]+assets[^"]+"[^>]*>/g, '');
  
  // Add link tags in head (before closing </head>)
  if (linkTags.length > 0) {
    const linksToAdd = linkTags.join('\n    ');
    updated404 = updated404.replace('</head>', `    ${linksToAdd}\n  </head>`);
  }
  
  // Add script tags before closing body tag
  if (scriptTags.length > 0) {
    const scriptsToAdd = scriptTags.join('\n    ');
    updated404 = updated404.replace('</body>', `    ${scriptsToAdd}\n  </body>`);
  }
  
  writeFileSync(join(distDir, '404.html'), updated404);
  console.log('✅ Updated 404.html with correct asset paths');
} else {
  console.warn('⚠️  Could not find script/link tags in index.html');
}

