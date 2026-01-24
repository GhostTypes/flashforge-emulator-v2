#!/usr/bin/env python3
"""
Skill Validator and Packager

Validates skills against the Agent Skills specification and packages them
into distributable .skill files (zip format).

Usage:
    python validate_and_package.py <skill-folder> [options]

Options:
    --validate-only   Only validate, don't package
    --output DIR      Output directory for .skill file (default: current dir)
    --verbose         Show detailed validation output

Examples:
    python validate_and_package.py my-skill
    python validate_and_package.py my-skill --validate-only
    python validate_and_package.py my-skill --output ./dist
"""

import sys
import re
import zipfile
import argparse
from pathlib import Path
from typing import Tuple, List, Optional

# Try to import yaml, provide fallback
try:
    import yaml
    HAS_YAML = True
except ImportError:
    HAS_YAML = False


# =============================================================================
# VALIDATION
# =============================================================================

class ValidationResult:
    def __init__(self):
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


def validate_skill(skill_path: Path, verbose: bool = False) -> ValidationResult:
    """
    Validate a skill against the Agent Skills specification.
    
    Checks:
    - SKILL.md exists
    - Valid YAML frontmatter
    - Required fields (name, description)
    - Name format (kebab-case, 1-64 chars, matches directory)
    - Description length (1-1024 chars)
    - No unexpected frontmatter keys
    - Token count recommendations
    """
    result = ValidationResult()
    skill_path = Path(skill_path).resolve()
    
    # Check skill folder exists
    if not skill_path.exists():
        result.error(f"Skill folder not found: {skill_path}")
        return result
    
    if not skill_path.is_dir():
        result.error(f"Path is not a directory: {skill_path}")
        return result
    
    result.ok(f"Skill folder found: {skill_path.name}")
    
    # Check SKILL.md exists
    skill_md = skill_path / "SKILL.md"
    if not skill_md.exists():
        result.error("SKILL.md not found")
        return result
    
    result.ok("SKILL.md found")
    
    # Read content
    try:
        content = skill_md.read_text(encoding="utf-8")
    except Exception as e:
        result.error(f"Failed to read SKILL.md: {e}")
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
        result.warning("PyYAML not installed - skipping detailed frontmatter validation")
        # Basic regex-based validation
        if "name:" not in frontmatter_text:
            result.error("Missing 'name' field in frontmatter")
        if "description:" not in frontmatter_text:
            result.error("Missing 'description' field in frontmatter")
        return result
    
    try:
        frontmatter = yaml.safe_load(frontmatter_text)
        if not isinstance(frontmatter, dict):
            result.error("Frontmatter must be a YAML dictionary")
            return result
    except yaml.YAMLError as e:
        result.error(f"Invalid YAML in frontmatter: {e}")
        return result
    
    result.ok("Valid YAML frontmatter")
    
    # Check allowed properties
    ALLOWED_KEYS = {"name", "description", "license", "compatibility", "metadata", "allowed-tools"}
    unexpected = set(frontmatter.keys()) - ALLOWED_KEYS
    if unexpected:
        result.error(f"Unexpected frontmatter keys: {', '.join(sorted(unexpected))}")
    
    # Validate 'name' field
    if "name" not in frontmatter:
        result.error("Missing required 'name' field")
    else:
        name = frontmatter["name"]
        if not isinstance(name, str):
            result.error(f"'name' must be a string, got {type(name).__name__}")
        else:
            name = name.strip()
            
            # Length check
            if len(name) < 1:
                result.error("'name' cannot be empty")
            elif len(name) > 64:
                result.error(f"'name' too long ({len(name)} chars). Maximum is 64.")
            else:
                result.ok(f"Name: {name}")
            
            # Format check (kebab-case)
            if not re.match(r"^[a-z0-9-]+$", name):
                result.error(f"'name' must be kebab-case (lowercase letters, digits, hyphens only)")
            
            # No leading/trailing/consecutive hyphens
            if name.startswith("-") or name.endswith("-"):
                result.error("'name' cannot start or end with hyphen")
            if "--" in name:
                result.error("'name' cannot contain consecutive hyphens")
            
            # Name should match directory
            if name != skill_path.name:
                result.warning(f"'name' ({name}) doesn't match directory ({skill_path.name})")
    
    # Validate 'description' field
    if "description" not in frontmatter:
        result.error("Missing required 'description' field")
    else:
        desc = frontmatter["description"]
        if not isinstance(desc, str):
            result.error(f"'description' must be a string, got {type(desc).__name__}")
        else:
            desc = desc.strip()
            
            if len(desc) < 1:
                result.error("'description' cannot be empty")
            elif len(desc) > 1024:
                result.error(f"'description' too long ({len(desc)} chars). Maximum is 1024.")
            else:
                result.ok(f"Description: {len(desc)} chars")
            
            # Check for angle brackets
            if "<" in desc or ">" in desc:
                result.error("'description' cannot contain angle brackets (< or >)")
            
            # Quality check - warn if too short
            if len(desc) < 50:
                result.warning("Description seems short. Include what it does AND when to use it.")
    
    # Check body content size (recommend < 5000 tokens, rough estimate ~4 chars/token)
    body_chars = len(body_content)
    estimated_tokens = body_chars // 4
    if estimated_tokens > 5000:
        result.warning(f"SKILL.md body is large (~{estimated_tokens} tokens). Consider moving details to references/")
    else:
        result.ok(f"Body size: ~{estimated_tokens} tokens (recommended < 5000)")
    
    # Check optional directories
    scripts_dir = skill_path / "scripts"
    references_dir = skill_path / "references"
    assets_dir = skill_path / "assets"
    
    if scripts_dir.exists():
        script_count = len(list(scripts_dir.rglob("*")))
        result.ok(f"scripts/ directory found ({script_count} files)")
    
    if references_dir.exists():
        ref_count = len(list(references_dir.rglob("*.md")))
        result.ok(f"references/ directory found ({ref_count} markdown files)")
    
    if assets_dir.exists():
        asset_count = len(list(assets_dir.rglob("*")))
        result.ok(f"assets/ directory found ({asset_count} files)")
    
    return result


# =============================================================================
# PACKAGING
# =============================================================================

def package_skill(skill_path: Path, output_dir: Optional[Path] = None) -> Optional[Path]:
    """
    Package a skill folder into a .skill file (zip format).
    
    Args:
        skill_path: Path to the skill folder
        output_dir: Directory for output file (default: current directory)
    
    Returns:
        Path to created .skill file, or None on error
    """
    skill_path = Path(skill_path).resolve()
    output_dir = Path(output_dir).resolve() if output_dir else Path.cwd()
    
    skill_name = skill_path.name
    output_file = output_dir / f"{skill_name}.skill"
    
    # Ensure output directory exists
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Files/dirs to skip
    SKIP_PATTERNS = {
        "__pycache__",
        ".pyc",
        ".git",
        ".DS_Store",
        "Thumbs.db",
        ".skill",
    }
    
    try:
        with zipfile.ZipFile(output_file, "w", zipfile.ZIP_DEFLATED) as zf:
            file_count = 0
            for file_path in skill_path.rglob("*"):
                if file_path.is_file():
                    # Skip unwanted files
                    if any(p in str(file_path) for p in SKIP_PATTERNS):
                        continue
                    
                    # Archive path includes skill folder name
                    arcname = file_path.relative_to(skill_path.parent)
                    zf.write(file_path, arcname)
                    file_count += 1
            
            print(f"   Packaged {file_count} files")
        
        return output_file
    
    except Exception as e:
        print(f"❌ Error creating .skill file: {e}")
        return None


# =============================================================================
# MAIN
# =============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="Validate and package skills for distribution",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    python validate_and_package.py my-skill
    python validate_and_package.py my-skill --validate-only
    python validate_and_package.py my-skill --output ./dist --verbose
        """
    )
    parser.add_argument("skill_path", help="Path to the skill folder")
    parser.add_argument("--validate-only", action="store_true", help="Only validate, don't package")
    parser.add_argument("--output", "-o", help="Output directory for .skill file")
    parser.add_argument("--verbose", "-v", action="store_true", help="Show detailed output")
    
    args = parser.parse_args()
    
    skill_path = Path(args.skill_path)
    
    print(f"\n{'='*60}")
    print(f"  Skill Validator & Packager")
    print(f"{'='*60}")
    print(f"  Skill: {skill_path}")
    print(f"{'='*60}\n")
    
    # Validate
    print("VALIDATING...\n")
    result = validate_skill(skill_path, verbose=args.verbose)
    
    # Show results
    for msg in result.info:
        print(f"   {msg}")
    
    for msg in result.warnings:
        print(f"   {msg}")
    
    for msg in result.errors:
        print(f"   {msg}")
    
    print()
    
    if not result.is_valid:
        print(f"❌ VALIDATION FAILED ({len(result.errors)} errors)")
        print("   Fix errors before packaging.\n")
        sys.exit(1)
    
    if result.warnings:
        print(f"⚠️  Valid with {len(result.warnings)} warnings\n")
    else:
        print("✓ VALIDATION PASSED\n")
    
    # Package if requested
    if args.validate_only:
        print("   Skipping packaging (--validate-only)\n")
        sys.exit(0)
    
    print("PACKAGING...\n")
    output_dir = Path(args.output) if args.output else None
    output_file = package_skill(skill_path, output_dir)
    
    if output_file:
        print(f"\n✓ SUCCESS: {output_file}\n")
        sys.exit(0)
    else:
        print("\n❌ PACKAGING FAILED\n")
        sys.exit(1)


if __name__ == "__main__":
    main()
