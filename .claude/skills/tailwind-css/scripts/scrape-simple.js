/**
 * Simple Tailwind CSS Documentation Scraper
 * Strips JSX/React components and converts MDX to clean markdown
 */

import { readFile, writeFile, mkdir, readdir, stat } from 'fs/promises';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Extract metadata from export statements
 */
function extractMetadata(source) {
  const metadata = {};
  const exportRegex = /^export\s+const\s+(\w+)\s*=\s*["'`](.+?)["'`];?$/gm;
  let match;

  while ((match = exportRegex.exec(source)) !== null) {
    metadata[match[1]] = match[2];
  }

  return metadata;
}

/**
 * Convert MDX to Markdown by stripping JSX
 */
function convertMdxToMarkdown(source) {
  let content = source;

  // Remove import statements
  content = content.replace(/^import\s+.+?from\s+['"][^'"]+['"]/gm, '');

  // Remove export statements
  content = content.replace(/^export\s+const\s+\w+\s*=\s*[^;]+;?$/gm, '');

  // Track code blocks to avoid processing them
  const codeBlocks = [];
  const codeBlockRegex = /```[\s\S]*?```|`[^`]+`/g;
  let match;
  let codeBlockIndex = 0;

  // Replace code blocks with placeholders
  content = content.replace(codeBlockRegex, (match) => {
    const placeholder = `__CODE_BLOCK_${codeBlockIndex}__`;
    codeBlocks.push({ placeholder, content: match });
    codeBlockIndex++;
    return placeholder;
  });

  // Remove JSX comments
  content = content.replace(/{\/\*[\s\S]*?\*\/}/g, '');

  // Handle self-closing JSX tags - remove them completely
  content = content.replace(/<[A-Z][A-Za-z0-9.]*[^>]*?\/>/g, '');

  // Handle JSX opening and closing tags - remove tags but keep content
  // This regex handles nested tags by removing the outermost tags first
  let previousContent;
  do {
    previousContent = content;
    // Remove opening tags
    content = content.replace(/<[A-Z][A-Za-z0-9.]*[^>]*?>/g, '');
    // Remove closing tags
    content = content.replace(/<\/[A-Z][A-Za-z0-9.]*>/g, '');
  } while (content !== previousContent);

  // Handle JSX expressions in braces - try to extract meaningful content
  content = content.replace(/{([^}]+)}/g, (match, expr) => {
    // If it's a simple string, number, or variable, keep it
    if (/^["'].*["']$/.test(expr.trim()) || /^\d+$/.test(expr.trim())) {
      return expr.trim().replace(/^["']|["']$/g, '');
    }
    // Otherwise remove it
    return '';
  });

  // Remove any remaining HTML/JSX tags (including lowercase HTML tags)
  content = content.replace(/<\/?[a-z][a-z0-9]*[^>]*?>/gi, '');

  // Remove className, style, and other JSX attributes
  content = content.replace(/\s+(className|style|onClick|onChange|onSubmit|ref|key|id)=["'][^"']*["']/g, '');
  content = content.replace(/\s+(className|style|onClick|onChange|onSubmit|ref|key|id)={[^}]*}/g, '');

  // Restore code blocks
  for (const { placeholder, content: blockContent } of codeBlocks) {
    content = content.replace(placeholder, blockContent);
  }

  // Clean up standalone semicolons (from removed export statements)
  content = content.replace(/^;+\s*$/gm, '');

  // Clean up excessive newlines (more than 2 consecutive)
  content = content.replace(/\n{3,}/g, '\n\n');

  // Clean up excessive spaces
  content = content.replace(/ {3,}/g, '  ');

  // Remove empty lines that only have whitespace
  content = content
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      return trimmed === '' ? '' : line.trimEnd();
    })
    .join('\n');

  // Clean up multiple consecutive empty lines again after processing
  content = content.replace(/\n\n\n+/g, '\n\n');

  // Trim the final result
  content = content.trim();

  return content;
}

/**
 * Find all MDX files in a directory
 */
async function findMdxFiles(dir, baseDir = dir) {
  const files = [];
  const entries = await readdir(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stats = await stat(fullPath);

    if (stats.isDirectory()) {
      const subFiles = await findMdxFiles(fullPath, baseDir);
      files.push(...subFiles);
    } else if (entry.endsWith('.mdx')) {
      const relativePath = relative(baseDir, fullPath);
      files.push({ fullPath, relativePath });
    }
  }

  return files;
}

/**
 * Process all docs for a version
 */
async function processVersion(docsDir, outputDir, version) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Processing Tailwind CSS ${version} documentation`);
  console.log(`${'='.repeat(60)}\n`);

  const files = await findMdxFiles(docsDir);
  console.log(`Found ${files.length} MDX files\n`);

  await mkdir(outputDir, { recursive: true });

  let processed = 0;
  let failed = 0;

  for (const { fullPath, relativePath } of files) {
    const outputPath = join(outputDir, relativePath.replace('.mdx', '.md'));

    try {
      await mkdir(dirname(outputPath), { recursive: true });

      const source = await readFile(fullPath, 'utf-8');
      const metadata = extractMetadata(source);
      const markdown = convertMdxToMarkdown(source);

      let output = '';

      if (Object.keys(metadata).length > 0) {
        output += '---\n';
        for (const [key, value] of Object.entries(metadata)) {
          output += `${key}: ${value}\n`;
        }
        output += '---\n\n';
      }

      output += markdown;

      await writeFile(outputPath, output, 'utf-8');
      processed++;

      if (processed % 10 === 0) {
        console.log(`Progress: ${processed}/${files.length} files processed`);
      }
    } catch (error) {
      failed++;
      console.error(`Failed to process ${relativePath}:`, error.message);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`${version} Summary: ${processed} processed, ${failed} failed`);
  console.log(`${'='.repeat(60)}\n`);

  return { processed, failed, total: files.length };
}

/**
 * Main function
 */
async function main() {
  const tailwindRepo = join(__dirname, 'tailwindcss-docs');
  const outputBase = join(__dirname, 'scraped-docs');

  console.log('Tailwind CSS Documentation Scraper (Simple Mode)');
  console.log('=================================================\n');

  // Process v4 (main branch) - src/docs
  // Process v3 (v3 branch) - src/pages/docs

  // Determine which version based on directory structure
  const v4DocsDir = join(tailwindRepo, 'src', 'docs');
  const v3DocsDir = join(tailwindRepo, 'src', 'pages', 'docs');

  let results = [];

  try {
    await stat(v4DocsDir);
    // v4 docs exist
    const v4OutputDir = join(outputBase, 'v4');
    const v4Results = await processVersion(v4DocsDir, v4OutputDir, 'v4.x');
    results.push({ version: 'v4.x', ...v4Results });
  } catch {
    // v4 doesn't exist, try v3
    try {
      await stat(v3DocsDir);
      // v3 docs exist
      const v3OutputDir = join(outputBase, 'v3');
      const v3Results = await processVersion(v3DocsDir, v3OutputDir, 'v3.x');
      results.push({ version: 'v3.x', ...v3Results });
    } catch (error) {
      console.error('Could not find docs directory for v3 or v4');
      throw error;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('FINAL SUMMARY');
  console.log('='.repeat(60));

  for (const result of results) {
    console.log(`\n${result.version}:`);
    console.log(`  Total files: ${result.total}`);
    console.log(`  Processed: ${result.processed}`);
    console.log(`  Failed: ${result.failed}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Output directory: ${outputBase}`);
  console.log('='.repeat(60) + '\n');
}

main().catch(console.error);
