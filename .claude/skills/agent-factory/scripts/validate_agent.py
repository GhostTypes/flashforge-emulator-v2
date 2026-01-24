#!/usr/bin/env python3
"""
Agent Validator

Validates Claude Code sub-agent markdown files against the expected format.

Usage:
    python validate_agent.py <agent-file.md>
    python validate_agent.py <agents-directory>

Examples:
    python validate_agent.py code-reviewer.md
    python validate_agent.py ~/.claude/agents/
"""

import sys
import re
import argparse
from pathlib import Path
from typing import List, Tuple, Optional

# Try to import yaml
try:
    import yaml
    HAS_YAML = True
except ImportError:
    HAS_YAML = False


# Valid values for frontmatter fields
VALID_MODELS = {"inherit", "sonnet", "opus", "haiku"}
VALID_PERMISSION_MODES = {"default", "acceptEdits", "dontAsk", "bypassPermissions", "plan"}
VALID_TOOLS = {
    "Read", "Write", "Edit", "Bash", "Grep", "Glob", "LS",
    "WebFetch", "WebSearch", "Task", "TodoRead", "TodoWrite",
    "AskUserQuestion", "Agent", "Notebook"
}
ALLOWED_FIELDS = {
    "name", "description", "tools", "disallowedTools", 
    "model", "permissionMode", "skills", "hooks"
}


class ValidationResult:
    def __init__(self, filepath: Path):
        self.filepath = filepath
        self.errors: List[str] = []
        self.warnings: List[str] = []
        self.info: List[str] = []
    
    @property
    def is_valid(self) -> bool:
        return len(self.errors) == 0
    
    def error(self, msg: str):
        self.errors.append(f"❌ {msg}")
    
    def warning(self, msg: str):
        self.warnings.append(f"⚠️  {msg}")
    
    def ok(self, msg: str):
        self.info.append(f"✓ {msg}")


def validate_agent_file(filepath: Path) -> ValidationResult:
    """Validate a single agent markdown file."""
    result = ValidationResult(filepath)
    
    # Check file exists
    if not filepath.exists():
        result.error(f"File not found: {filepath}")
        return result
    
    if not filepath.is_file():
        result.error(f"Not a file: {filepath}")
        return result
    
    if filepath.suffix.lower() != ".md":
        result.error("Agent files must have .md extension")
        return result
    
    result.ok(f"File: {filepath.name}")
    
    # Read content
    try:
        content = filepath.read_text(encoding="utf-8")
    except Exception as e:
        result.error(f"Failed to read file: {e}")
        return result
    
    # Check frontmatter exists
    if not content.startswith("---"):
        result.error("No YAML frontmatter found (must start with ---)")
        return result
    
    # Extract frontmatter
    match = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
    if not match:
        result.error("Invalid frontmatter format (must be ---\\n...\\n---)")
        return result
    
    frontmatter_text = match.group(1)
    body_content = content[match.end():].strip()
    
    # Parse YAML
    if not HAS_YAML:
        result.warning("PyYAML not installed - using basic validation")
        if "name:" not in frontmatter_text:
            result.error("Missing 'name' field")
        if "description:" not in frontmatter_text:
            result.error("Missing 'description' field")
        return result
    
    try:
        frontmatter = yaml.safe_load(frontmatter_text)
        if not isinstance(frontmatter, dict):
            result.error("Frontmatter must be a YAML dictionary")
            return result
    except yaml.YAMLError as e:
        result.error(f"Invalid YAML: {e}")
        return result
    
    result.ok("Valid YAML frontmatter")
    
    # Check for unexpected fields
    unexpected = set(frontmatter.keys()) - ALLOWED_FIELDS
    if unexpected:
        result.warning(f"Unexpected fields: {', '.join(sorted(unexpected))}")
    
    # Validate 'name'
    if "name" not in frontmatter:
        result.error("Missing required 'name' field")
    else:
        name = frontmatter["name"]
        if not isinstance(name, str):
            result.error(f"'name' must be string, got {type(name).__name__}")
        else:
            name = name.strip()
            if not re.match(r"^[a-z0-9-]+$", name):
                result.error("'name' must be kebab-case (lowercase, digits, hyphens)")
            elif name.startswith("-") or name.endswith("-") or "--" in name:
                result.error("'name' cannot start/end with hyphen or have consecutive hyphens")
            else:
                result.ok(f"Name: {name}")
            
            # Check name matches filename
            expected_filename = f"{name}.md"
            if filepath.name != expected_filename:
                result.warning(f"Filename should be '{expected_filename}' to match name")
    
    # Validate 'description'
    if "description" not in frontmatter:
        result.error("Missing required 'description' field")
    else:
        desc = frontmatter["description"]
        if not isinstance(desc, str):
            result.error(f"'description' must be string, got {type(desc).__name__}")
        else:
            desc = desc.strip()
            if len(desc) < 10:
                result.warning("Description seems too short for good auto-delegation")
            else:
                result.ok(f"Description: {len(desc)} chars")
    
    # Validate 'model'
    if "model" in frontmatter:
        model = frontmatter["model"]
        if isinstance(model, str) and model.lower() not in VALID_MODELS:
            result.warning(f"Unknown model '{model}'. Valid: {', '.join(sorted(VALID_MODELS))}")
        else:
            result.ok(f"Model: {model}")
    
    # Validate 'permissionMode'
    if "permissionMode" in frontmatter:
        mode = frontmatter["permissionMode"]
        if isinstance(mode, str) and mode not in VALID_PERMISSION_MODES:
            result.error(f"Invalid permissionMode '{mode}'. Valid: {', '.join(VALID_PERMISSION_MODES)}")
        else:
            result.ok(f"Permission mode: {mode}")
    
    # Validate 'tools'
    if "tools" in frontmatter:
        tools_val = frontmatter["tools"]
        if isinstance(tools_val, str):
            tools = [t.strip() for t in tools_val.split(",")]
        elif isinstance(tools_val, list):
            tools = tools_val
        else:
            tools = []
            result.warning("'tools' should be comma-separated string or list")
        
        unknown_tools = set(tools) - VALID_TOOLS
        if unknown_tools:
            result.warning(f"Unknown tools: {', '.join(sorted(unknown_tools))}")
        else:
            result.ok(f"Tools: {len(tools)} specified")
    
    # Check body content
    if not body_content:
        result.warning("No prompt/instructions in body content")
    else:
        word_count = len(body_content.split())
        result.ok(f"Body: {word_count} words")
    
    return result


def validate_directory(dirpath: Path) -> List[ValidationResult]:
    """Validate all .md files in a directory."""
    results = []
    md_files = list(dirpath.glob("*.md"))
    
    if not md_files:
        print(f"No .md files found in {dirpath}")
        return results
    
    for filepath in sorted(md_files):
        results.append(validate_agent_file(filepath))
    
    return results


def main():
    parser = argparse.ArgumentParser(
        description="Validate Claude Code sub-agent files",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    python validate_agent.py code-reviewer.md
    python validate_agent.py ~/.claude/agents/
    python validate_agent.py .claude/agents/
        """
    )
    parser.add_argument("path", help="Agent file (.md) or directory containing agents")
    
    args = parser.parse_args()
    path = Path(args.path).expanduser()
    
    print(f"\n{'='*60}")
    print("  Agent Validator")
    print(f"{'='*60}\n")
    
    if path.is_file():
        results = [validate_agent_file(path)]
    elif path.is_dir():
        results = validate_directory(path)
    else:
        print(f"❌ Path not found: {path}")
        sys.exit(1)
    
    # Print results
    total_errors = 0
    total_warnings = 0
    
    for result in results:
        print(f"  {result.filepath.name}")
        print(f"  {'-'*40}")
        
        for msg in result.info:
            print(f"    {msg}")
        for msg in result.warnings:
            print(f"    {msg}")
        for msg in result.errors:
            print(f"    {msg}")
        
        print()
        
        total_errors += len(result.errors)
        total_warnings += len(result.warnings)
    
    # Summary
    print(f"{'='*60}")
    valid_count = sum(1 for r in results if r.is_valid)
    print(f"  {valid_count}/{len(results)} agents valid")
    if total_warnings:
        print(f"  {total_warnings} warnings")
    if total_errors:
        print(f"  {total_errors} errors")
    print(f"{'='*60}\n")
    
    sys.exit(0 if total_errors == 0 else 1)


if __name__ == "__main__":
    main()
