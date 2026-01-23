---
name: tailwind-css
description: Professional Tailwind CSS development for both v3.x (legacy) and v4.x (latest). Use when working with Tailwind CSS for (1) writing or editing HTML/JSX/Vue/Svelte files with Tailwind utility classes, (2) answering questions about Tailwind utilities, syntax, or best practices, (3) configuring, installing, or setting up Tailwind in projects, (4) migrating from v3 to v4, (5) debugging Tailwind-related issues, (6) building responsive layouts, dark mode, or custom themes, or (7) any task involving Tailwind CSS utility classes, configuration, or documentation.
---

## Overview

This skill provides complete documentation for Tailwind CSS v3.x and v4.x, enabling you to work with both legacy projects (v3) and modern projects (v4). Documentation is organized for efficient progressive loading - only load what you need.

## Version Detection

**Always auto-detect the project's Tailwind version first** before referencing documentation:

1. **Check package.json** for `tailwindcss` version:
   - `^3.x` or `~3.x` → Use v3 docs
   - `^4.x` or `~4.x` → Use v4 docs

2. **Check for config files**:
   - `tailwind.config.js` or `tailwind.config.ts` → Likely v3
   - CSS-based config with `@theme` directive → v4

3. **Check CSS imports**:
   - `@tailwind base; @tailwind components; @tailwind utilities;` → v3
   - `@import "tailwindcss";` → v4

4. **When uncertain**: Default to v4 (latest) unless clear v3 indicators present.

## Documentation Structure

All documentation lives in `references/`:

```
references/
├── README.md          # Overview of both versions
├── v4/
│   ├── README.md     # v4 feature guide & navigation
│   └── *.md          # 185 v4 documentation files
└── v3/
    ├── README.md     # v3 feature guide & navigation
    └── *.md          # 187 v3 documentation files
```

## Finding Documentation

### Start with READMEs

1. **Always read** `references/README.md` first for version differences overview
2. **Then read** version-specific README:
   - `references/v4/README.md` for v4 projects
   - `references/v3/README.md` for v3 projects

The READMEs organize docs by category (Layout, Typography, Colors, Effects, etc.) and list all files - use them to find what you need.

### Navigation Strategy

**For utility questions** ("How do I center text?", "What's the flexbox class?"):
1. Identify the utility category from the README
2. Read the specific utility file (e.g., `text-align.md`, `flex.md`)

**For concept questions** ("How does dark mode work?", "How do I make it responsive?"):
1. Find the concept file in the README's "Core Concepts" section
2. Read the concept file (e.g., `dark-mode.md`, `responsive-design.md`)

**For setup/config questions**:
- v4: Read `upgrade-guide.md`, `theme.md`, `functions-and-directives.md`
- v3: Read `adding-custom-styles.md`, `functions-and-directives.md`

### Common Files

These files answer 80% of questions:

**v4:**
- `responsive-design.md` - Breakpoints and mobile-first
- `dark-mode.md` - Dark mode implementation
- `hover-focus-and-other-states.md` - State variants (hover, focus, active, etc.)
- `colors.md` - Color palette and usage
- `theme.md` - CSS-first configuration
- `upgrade-guide.md` - Migrating from v3

**v3:**
- `responsive-design.md` - Breakpoints and mobile-first
- `dark-mode.md` - Dark mode implementation
- `hover-focus-and-other-states.md` - State variants
- `customizing-colors.md` - Color customization
- `adding-custom-styles.md` - Configuration and customization

## Key Version Differences

### v4 (Latest)

- **Config**: CSS-first with `@theme` directive, no `tailwind.config.js`
- **Import**: `@import "tailwindcss";`
- **Packages**: `@tailwindcss/postcss`, `@tailwindcss/vite`, `@tailwindcss/cli`
- **Browser support**: Safari 16.4+, Chrome 111+, Firefox 128+
- **New features**: Lightning CSS, native CSS variables

### v3 (Legacy)

- **Config**: JavaScript `tailwind.config.js`
- **Import**: `@tailwind base; @tailwind components; @tailwind utilities;`
- **Package**: `tailwindcss` (PostCSS plugin)
- **Browser support**: Broad compatibility including older browsers
- **Unique utilities**: `space-between`, `divide-*`, ring utilities

## Working with This Skill

### Standard Workflow

1. **Detect version** using package.json or config files
2. **Read version README** (`references/v4/README.md` or `references/v3/README.md`)
3. **Find relevant docs** using README categories
4. **Read specific files** as needed for utilities or concepts
5. **Answer user's question** with version-appropriate guidance

### Upgrade/Migration Support

When users request help migrating from v3 to v4:

1. Read `references/v4/upgrade-guide.md` for comprehensive migration steps
2. Focus on:
   - Config migration (JS → CSS)
   - Import syntax changes
   - Package updates
   - Breaking changes
3. Suggest using `@tailwindcss/upgrade` CLI tool for automated migration
4. Provide manual guidance for complex scenarios

**Do not** proactively suggest upgrades unless user asks - many projects intentionally use v3 for browser support or stability.

## Updating Documentation

When Tailwind releases new versions and documentation needs updating:

### Using the Scraper

The skill includes a scraper to convert Tailwind's official MDX documentation to markdown:

**Location**: `scripts/scrape-simple.js` and `scripts/package.json`

**Steps**:

1. Clone the Tailwind docs repo:
   ```bash
   git clone https://github.com/tailwindlabs/tailwindcss.com.git
   ```

2. Install scraper dependencies:
   ```bash
   cd /path/to/skill/scripts
   npm install
   ```

3. For v4 docs (main branch is already checked out):
   ```bash
   npm run scrape:simple
   ```

4. For v3 docs:
   ```bash
   cd /path/to/tailwindcss.com
   git checkout v3
   cd /path/to/skill/scripts
   npm run scrape:simple
   ```

5. The scraper outputs to `scraped-docs/` in the script directory:
   - `scraped-docs/v4/` - v4 documentation
   - `scraped-docs/v3/` - v3 documentation

6. Copy the scraped docs to `references/`:
   ```bash
   cp -r scraped-docs/v4/* /path/to/skill/references/v4/
   cp -r scraped-docs/v3/* /path/to/skill/references/v3/
   ```

7. Update the READMEs if major changes occurred

**The scraper**:
- Converts MDX to clean markdown
- Preserves code examples and frontmatter
- Removes JSX/React components
- Handles both v3 and v4 documentation structures

## Best Practices

1. **Always verify version first** - Don't guess, check package.json
2. **Use READMEs for navigation** - They're organized for fast lookup
3. **Load docs progressively** - Only read what you need
4. **Provide examples** - Show code, don't just explain
5. **Reference file locations** - Tell users where to find more details
6. **Stay version-appropriate** - Don't mix v3 and v4 syntax

## Example Interactions

**User: "How do I center text?"**
1. Detect version → v4
2. Read `references/v4/README.md` → Find "Typography" section
3. Read `references/v4/text-align.md`
4. Answer: "Use `text-center` class"

**User: "How does dark mode work?"**
1. Detect version → v3
2. Read `references/v3/README.md` → Find "Core Concepts"
3. Read `references/v3/dark-mode.md`
4. Provide dark mode setup and usage guidance

**User: "Help me migrate to v4"**
1. Read `references/v4/upgrade-guide.md`
2. Suggest `npx @tailwindcss/upgrade` tool
3. Provide manual migration steps for their specific codebase

## Token Efficiency Tips

- **Don't read entire files** if you only need one section
- **Use READMEs first** - they're concise category guides
- **Remember common patterns** - Many utilities follow consistent naming (e.g., `text-*`, `bg-*`, `border-*`)
- **Load concept docs once** - Responsive design and dark mode patterns apply across utilities
