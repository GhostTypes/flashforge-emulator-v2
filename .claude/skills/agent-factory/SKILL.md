---
name: agent-factory
description: |
  Drop into any codebase to identify what sub-agents should be produced. Scans the workspace
  to detect patterns suggesting useful agents (test suites, APIs, databases, large codebases).
  Also discovers existing agents and provides comprehensive templates. Use when: (1) Entering
  a new workspace without agents, (2) Bootstrapping agent capabilities, (3) Creating specialized
  task-delegation workflows. Includes agent templates and validation.
---

# Agent Factory

Drop this skill into any codebase to identify what sub-agents should be produced.

## Sub-Agents vs Skills

| Aspect | Skills | Sub-Agents |
|--------|--------|------------|
| **Purpose** | Knowledge/patterns | Task delegation |
| **Location** | `.claude/skills/` | `.claude/agents/` |
| **File** | Folder with `SKILL.md` | Single `.md` file |
| **Activation** | Semantic matching | Explicit or auto-delegation |
| **Key features** | Progressive disclosure | Tool restrictions, model choice |

**Use sub-agents when you want to:**

- Preserve context (keep exploration out of main conversation)
- Route tasks to faster/cheaper models (Haiku for exploration)
- Enforce tool restrictions (read-only agents)
- Run parallel research in background

---

## Workflow

### Phase 1: Analyze Codebase

Run the scanner to identify agent opportunities:

```bash
python scripts/scan_codebase.py /path/to/project
```

The scanner detects patterns that suggest useful agents:

| Pattern | Agent Suggestion |
|---------|-----------------|
| Test files (`*.test.*`, `*.spec.*`) | `test-runner` |
| Database schemas/migrations | `db-specialist` |
| API routes/endpoints | `api-reviewer` |
| Build configs | `build-debugger` |
| Large codebase (5k+ files) | `explorer` (haiku) |
| Security-sensitive code | `security-auditor` |

### Phase 2: Discover Existing Agents

Check for existing agents:

- Project: `.claude/agents/`
- User: `~/.claude/agents/`
- View all: Use `/agents` command in Claude Code

### Phase 3: Create Agents

1. Choose a template from [agent-templates.md](references/agent-templates.md)
2. Customize the description and prompt
3. Save to `.claude/agents/agent-name.md`
4. Test with `/agents` or by asking Claude to use it

---

## Agent File Format

```yaml
---
name: agent-name
description: |
  What this agent does and when Claude should delegate to it.
  Be specific - Claude uses this for auto-delegation.
model: inherit
---

[System prompt / instructions for the agent]
```

### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Kebab-case identifier |
| `description` | Yes | Trigger conditions for delegation |
| `model` | No | `inherit`, `sonnet`, `opus`, `haiku` (default: inherit) |
| `tools` | No | Allowed tools (default: all) |
| `disallowedTools` | No | Blocked tools |
| `permissionMode` | No | `default`, `acceptEdits`, `dontAsk`, `bypassPermissions`, `plan` |
| `skills` | No | Skills to preload into the agent |
| `hooks` | No | Lifecycle hooks (PreToolUse, etc.) |

---

## Quick Templates

### Code Reviewer

```yaml
---
name: code-reviewer
description: |
  Reviews code for quality, security, and best practices.
  Use after writing or modifying code. Proactively reviews git diff.
model: inherit
---

You are a senior code reviewer. When invoked:
1. Run git diff to see recent changes
2. Review for: clarity, naming, duplication, error handling, security, tests
3. Organize feedback by priority: Critical → Warnings → Suggestions
4. Include specific fix examples
```

### Test Runner

```yaml
---
name: test-runner
description: |
  Runs tests, analyzes failures, and fixes broken tests.
  Use when tests are failing or after code changes.
model: inherit
---

You are a testing specialist. When invoked:
1. Run the test suite
2. For failures: identify root cause, implement fix, verify
3. Report summary: passed, failed, fixed
```

### Explorer (Fast Research)

```yaml
---
name: explorer
description: |
  Fast codebase exploration and research. Use for file discovery,
  understanding project structure, or finding specific code patterns.
model: haiku
---

You are a codebase researcher. Quickly explore and summarize:
- Project structure and key files
- How specific features are implemented
- Where to find particular patterns
Keep responses concise - you're providing research for the main conversation.
```

### Debugger

```yaml
---
name: debugger
description: |
  Debugging specialist for errors and unexpected behavior.
  Use when encountering any issues, errors, or test failures.
model: inherit
---

You are an expert debugger. When invoked:
1. Capture error message and stack trace
2. Identify reproduction steps
3. Isolate failure location
4. Implement minimal fix
5. Verify solution

Provide: root cause, evidence, fix, prevention recommendations.
```

See [references/agent-templates.md](references/agent-templates.md) for more comprehensive templates.

---

## Using Agents

### Explicit Delegation

```
Use the test-runner agent to fix failing tests
Have the code-reviewer look at my recent changes
```

### Auto-Delegation

Claude automatically delegates based on the `description` field. Write specific trigger conditions:

**Good**: "Use when tests are failing or after modifying test files"
**Bad**: "Helps with testing"

### Foreground vs Background

- **Foreground**: Blocks main conversation, can ask questions
- **Background**: Runs concurrently, auto-denies permissions it doesn't have

```
Run the test-runner in the background while I work on the frontend
```

---

## Notes

- Agents inherit permissions from the main conversation unless restricted
- Use `model: haiku` for fast, cheap exploration tasks
- Background agents can't use MCP tools
- Check into version control to share project agents with team
