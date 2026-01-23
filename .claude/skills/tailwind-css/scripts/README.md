# Tailwind Documentation Scraper

This directory contains a script to scrape and convert Tailwind CSS documentation from MDX to markdown.

## Files

- `scrape-simple.js` - Main scraper script
- `package.json` - Dependencies for the scraper

## Usage

### Setup

1. Clone the Tailwind documentation repository:
   ```bash
   git clone https://github.com/tailwindlabs/tailwindcss.com.git
   ```

2. Install dependencies:
   ```bash
   cd /path/to/skill/scripts
   npm install
   ```

### Scraping Documentation

**For v4 documentation** (main branch):
```bash
# Ensure tailwindcss.com repo is on main branch
cd /path/to/tailwindcss.com
git checkout main
cd /path/to/skill/scripts
npm run scrape:simple
```

**For v3 documentation** (v3 branch):
```bash
# Switch to v3 branch
cd /path/to/tailwindcss.com
git checkout v3
cd /path/to/skill/scripts
npm run scrape:simple
```

### Output

The scraper creates a `scraped-docs/` directory with:
- `v4/` - Tailwind CSS v4 documentation (if scraped from main branch)
- `v3/` - Tailwind CSS v3 documentation (if scraped from v3 branch)

Each directory contains:
- README.md - Version-specific overview
- *.md files - Individual documentation pages

### Updating Skill References

After scraping, copy the output to the skill's references:

```bash
# Copy v4 docs
cp -r scraped-docs/v4/* /path/to/skill/references/v4/

# Copy v3 docs
cp -r scraped-docs/v3/* /path/to/skill/references/v3/
```

## How It Works

The scraper:
1. Detects version based on directory structure:
   - v4: `src/docs/` (main branch)
   - v3: `src/pages/docs/` (v3 branch)

2. Finds all `.mdx` files recursively

3. For each MDX file:
   - Extracts frontmatter metadata (title, description)
   - Removes import/export statements
   - Strips JSX/React components
   - Cleans HTML tags and attributes
   - Preserves code blocks
   - Outputs clean markdown

4. Writes converted files maintaining directory structure

## Conversion Quality

The scraper produces clean markdown with:
- ✓ Preserved frontmatter metadata
- ✓ Intact code examples
- ✓ Removed JSX/React components
- ✓ Cleaned HTML artifacts
- ✓ Proper formatting

Some minor artifacts may remain but don't affect readability or usefulness.

## Requirements

- Node.js 18+
- npm
- Tailwind documentation repository cloned locally

## Dependencies

The scraper has no runtime dependencies - it uses only Node.js built-in modules (fs/promises, path, url).
