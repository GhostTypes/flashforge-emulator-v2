# Agent Specification Reference

Reference for Claude Code sub-agent file format. See [official docs](https://code.claude.com/docs/en/sub-agents).

## File Location

| Scope | Location |
|-------|----------|
| Project | `.claude/agents/agent-name.md` |
| User | `~/.claude/agents/agent-name.md` |

## File Format

```yaml
---
name: agent-name
description: |
  What this agent does and when to delegate to it.
model: inherit
---

[System prompt / instructions]
```

## Frontmatter Fields

### Required

| Field | Constraints |
|-------|-------------|
| `name` | Kebab-case, must match filename |
| `description` | Trigger conditions for auto-delegation |

### Optional

| Field | Values | Default |
|-------|--------|---------|
| `model` | `inherit`, `sonnet`, `opus`, `haiku` | `inherit` |
| `tools` | Comma-separated tool names | All tools |
| `disallowedTools` | Tools to block | None |
| `permissionMode` | `default`, `acceptEdits`, `dontAsk`, `bypassPermissions`, `plan` | `default` |
| `skills` | List of skills to preload | None |
| `hooks` | Lifecycle hooks | None |

## Available Tools

```
Read, Write, Edit, Bash, Grep, Glob, LS, 
WebFetch, WebSearch, Task, TodoRead, TodoWrite,
AskUserQuestion, Agent
```

## Permission Modes

| Mode | Behavior |
|------|----------|
| `default` | Prompts for dangerous operations |
| `acceptEdits` | Auto-accepts edits, prompts for Bash |
| `dontAsk` | Fails silently on denied operations |
| `bypassPermissions` | No prompts (dangerous) |
| `plan` | Read-only mode |

## Hooks (PreToolUse)

```yaml
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate.sh"
```

Exit codes: 0 = proceed, 2 = block

## Built-in Agents

| Name | Model | Purpose |
|------|-------|---------|
| Explore | Haiku | Fast file discovery |
| Plan | inherit | Read-only planning |
| General | inherit | Complex operations |

## Commands

- `/agents` - View, create, edit agents
- `claude --agents '{...}'` - Inline agent definition

## Best Practices

1. **Focused purpose** - One agent, one specialty
2. **Specific descriptions** - Include exact trigger conditions
3. **Minimal prompts** - Agent should work independently
4. **Version control** - Check project agents into git
