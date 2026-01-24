# Agent Skills Specification Reference

This is a condensed reference from [agentskills.io/specification](https://agentskills.io/specification).

## Directory Structure

```
skill-name/
├── SKILL.md              # Required
├── scripts/              # Optional - executable helpers
├── references/           # Optional - detailed docs loaded on demand
└── assets/               # Optional - templates, images, data files
```

## SKILL.md Frontmatter

```yaml
---
name: skill-name
description: |
  What this skill does and when to use it.
  Include trigger conditions and keywords.
license: Apache-2.0
compatibility: Requires git, docker
metadata:
  author: example-org
  version: "1.0"
allowed-tools: Bash(git:*) Read
---
```

### Required Fields

| Field | Constraints |
|-------|-------------|
| `name` | 1-64 chars, lowercase kebab-case (a-z and -), must match directory |
| `description` | 1-1024 chars, include what it does AND when to use it |

### Optional Fields

| Field | Purpose |
|-------|---------|
| `license` | License name or reference to LICENSE file |
| `compatibility` | Environment requirements |
| `metadata` | Custom key-value pairs |
| `allowed-tools` | Pre-approved tools (experimental) |

## Progressive Disclosure

1. **Metadata** (~100 tokens): `name` + `description` loaded at startup
2. **Instructions** (<5000 tokens): SKILL.md body loaded on activation
3. **Resources** (as needed): scripts/, references/, assets/ loaded on demand

Keep SKILL.md under 5000 tokens. Move detailed documentation to references/.

## Body Content

Include:

- Step-by-step instructions
- Examples of inputs and outputs
- Common edge cases

## references/ Directory

Suggested files:

- `REFERENCE.md` - Detailed technical reference
- `FORMS.md` - Form templates or structured data
- Domain-specific files (e.g., `api.md`, `patterns.md`)

Files are loaded only when referenced in SKILL.md.

## scripts/ Directory

Scripts should:

- Be self-contained or document dependencies
- Include helpful error messages
- Handle edge cases gracefully

## Validation

```bash
skills-ref validate ./my-skill
```

See [skills-ref on GitHub](https://github.com/agentskills/agentskills/tree/main/skills-ref).
