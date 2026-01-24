---
name: skill-factory
description: |
  Drop into any codebase to identify what skills should be produced. Scans the workspace to
  detect programming languages, frameworks, and libraries. Also discovers existing documentation
  that can be packaged into skills. Use when: (1) Entering a new workspace without skills,
  (2) Bootstrapping agent capabilities for a project, (3) Auditing skill coverage gaps.
  Includes scraper, format converters, and skill creation guide.
---

# Skill Factory

Drop this skill into any new codebase to identify what skills should be produced.

## Philosophy

When you enter a new workspace, the agent starts from zero. This skill bootstraps that process by:

1. Analyzing the codebase to identify technologies
2. Discovering existing documentation that can become skills
3. Guiding you through skill creation

---

## Workflow

### Phase 1: Run the Scanner

```bash
python scripts/scan_codebase.py /path/to/project
```

Detects languages, frameworks, libraries, build tools, and existing skills.

### Phase 2: Discover Existing Documentation

**Before scraping external docs, check if the workspace already has documentation that should become a skill.**

Look for these patterns in the codebase:

| Pattern | Skill Potential |
|---------|-----------------|
| `docs/`, `documentation/` | HIGH - Structured project docs |
| `README.md` with detailed usage | MEDIUM - Quick reference material |
| `.claude/`, `.agent/`, `.cursor/` | HIGH - Existing agent instructions |
| `CONTRIBUTING.md`, `ARCHITECTURE.md` | MEDIUM - Project-specific patterns |
| `examples/`, `tutorials/` | MEDIUM - Usage patterns |
| API docs (`openapi.yaml`, `swagger.json`) | HIGH - API reference |
| Config files with extensive comments | LOW - Configuration patterns |

**Why package docs into skills?**

- **Progressive disclosure**: SKILL.md loads on activation (~5000 tokens), references/ load on demand
- **Semantic matching**: Good descriptions help the agent find the skill when relevant
- **Structured access**: Better than pointing at a raw folder of markdown files

### Phase 3: Produce Skills

For each identified skill need:

1. **If docs exist locally** → Package into a skill (see [Creating Skills](#creating-skills))
2. **If docs are external** → Scrape and convert:

   ```bash
   python scripts/scrape_url.py --crawl https://docs.example.com/guide/ ./scraped/ --max-pages 30
   ```

3. **Create the skill structure** with proper frontmatter and references

---

## Creating Skills

Skills follow the [Agent Skills Specification](https://agentskills.io/specification).

### Directory Structure

```
skill-name/
├── SKILL.md              # Required - main instructions
├── scripts/              # Optional - executable helpers
├── references/           # Optional - detailed docs loaded on demand
└── assets/               # Optional - templates, images, data files
```

### SKILL.md Format

```yaml
---
name: skill-name
description: |
  What this skill does and when to use it. Include specific keywords
  that help agents identify relevant tasks. Use phrases like:
  "Use when:", "Helps with:", "Solves:".
---

# Skill Name

[Instructions, examples, and workflows - keep under 5000 tokens]
```

### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Kebab-case, 1-64 chars, must match directory name |
| `description` | Yes | 1-1024 chars, describes what and when to use |
| `license` | No | License name or reference to LICENSE file |
| `compatibility` | No | Environment requirements (tools, network, etc.) |
| `metadata` | No | Custom key-value pairs (author, version, etc.) |
| `allowed-tools` | No | Pre-approved tools (experimental) |

### Progressive Disclosure Pattern

1. **Metadata** (~100 tokens): `name` + `description` loaded at startup for all skills
2. **Instructions** (<5000 tokens): Full SKILL.md body loaded when skill activates
3. **Resources** (as needed): Files in scripts/, references/, assets/ loaded on demand

**Example**: For a FastAPI skill:

- SKILL.md: Core patterns, common gotchas, quick reference
- references/endpoints.md: Detailed endpoint configuration
- references/middleware.md: Middleware deep dive
- scripts/generate_routes.py: Helper script

### Writing Good Descriptions

**Good** - Specific, searchable, includes trigger conditions:

```yaml
description: |
  Fix for "ENOENT: no such file or directory" errors in npm workspaces.
  Use when: (1) npm run fails with ENOENT, (2) paths work in root but 
  not packages, (3) symlinked dependencies cause resolution failures.
```

**Bad** - Vague, won't match:

```yaml
description: Helps with npm problems.
```

---

## Scanner Output Options

```bash
# ASCII table (default)
python scripts/scan_codebase.py /project

# JSON for programmatic use
python scripts/scan_codebase.py /project --format json

# Markdown report
python scripts/scan_codebase.py /project --format markdown > skill-plan.md
```

---

## Scraper and Converters

### Web Scraper

```bash
# Single page
python scripts/scrape_url.py https://example.com/docs page.md

# Crawl entire section
python scripts/scrape_url.py --crawl https://example.com/docs/ ./output/ --max-pages 50

# Batch from file
python scripts/scrape_url.py --batch urls.txt ./output/
```

### Format Converters

```bash
# MDX → Markdown (strips JSX)
python scripts/converters/mdx_to_md.py input.mdx output.md
python scripts/converters/mdx_to_md.py --dir ./mdx-docs ./md-docs

# RST → Markdown (Python docs)
python scripts/converters/rst_to_md.py input.rst output.md

# HTML → Markdown (extracts main content)
python scripts/converters/html_to_md.py input.html output.md
```

---

## What Gets Detected

**Languages**: Python, TypeScript, JavaScript, Rust, Go, Java, Kotlin, C#, Ruby, PHP, Swift, Dart, and 30+ more.

**Frameworks** (80+ signatures): React, Vue, Angular, Next.js, FastAPI, Django, Flask, Express, NestJS, Prisma, Tailwind, and more.

**Package Managers**: npm, pip, cargo, go mod, composer, bundler, pub, maven, gradle.

---

## Notes

- Scanner respects `.gitignore` and skips common exclusions (node_modules, .git, etc.)
- Existing skills in `.claude/skills/` are detected to avoid duplication
- Website docs are generally preferred over repos (more structured)
