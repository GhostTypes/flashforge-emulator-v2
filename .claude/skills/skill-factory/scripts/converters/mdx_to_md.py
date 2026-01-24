#!/usr/bin/env python3
"""
MDX to Markdown converter.
Strips JSX components while preserving markdown content.

Usage:
  mdx_to_md.py <input.mdx> [output.md]
  mdx_to_md.py --dir <input_dir> <output_dir>
"""

import sys
import re
import argparse
from pathlib import Path


def convert_mdx_to_md(content: str) -> str:
    """
    Convert MDX content to clean Markdown.
    
    - Removes import statements
    - Removes JSX components (both self-closing and paired)
    - Preserves code blocks
    - Preserves frontmatter
    """
    lines = content.split('\n')
    result = []
    
    in_code_block = False
    in_frontmatter = False
    frontmatter_count = 0
    in_jsx_component = False
    jsx_depth = 0
    
    for line in lines:
        stripped = line.strip()
        
        # Track frontmatter
        if stripped == '---':
            frontmatter_count += 1
            if frontmatter_count <= 2:
                result.append(line)
                in_frontmatter = frontmatter_count == 1
                continue
        
        if in_frontmatter:
            result.append(line)
            continue
        
        # Track code blocks
        if stripped.startswith('```'):
            in_code_block = not in_code_block
            result.append(line)
            continue
        
        if in_code_block:
            result.append(line)
            continue
        
        # Skip import statements
        if re.match(r'^import\s+', stripped):
            continue
        
        # Skip export statements (but keep export default for content)
        if re.match(r'^export\s+(?!default)', stripped):
            continue
        
        # Handle JSX components
        
        # Self-closing JSX: <Component ... />
        line = re.sub(r'<[A-Z][A-Za-z0-9]*[^>]*/>', '', line)
        
        # Opening JSX tag: <Component ...> (not self-closing)
        jsx_open_match = re.search(r'<([A-Z][A-Za-z0-9]*)[^/>]*(?<!/)>', line)
        if jsx_open_match:
            in_jsx_component = True
            jsx_depth = 1
            # Remove the opening tag portion
            line = re.sub(r'<[A-Z][A-Za-z0-9]*[^/>]*(?<!/)>', '', line)
        
        # Handle nested/closing JSX
        if in_jsx_component:
            # Count opening and closing tags
            opens = len(re.findall(r'<[A-Z][A-Za-z0-9]*[^/>]*(?<!/)>', line))
            closes = len(re.findall(r'</[A-Z][A-Za-z0-9]*>', line))
            jsx_depth += opens - closes
            
            if jsx_depth <= 0:
                in_jsx_component = False
                jsx_depth = 0
            
            # Remove closing tags
            line = re.sub(r'</[A-Z][A-Za-z0-9]*>', '', line)
            
            # Skip lines that are now empty or just whitespace
            if not line.strip():
                continue
        
        # Handle inline JSX expressions: {expression}
        # Keep simple text, remove complex expressions
        line = re.sub(r'\{[^}]*\}', '', line)
        
        # Remove any HTML-style comments
        line = re.sub(r'{/\*.*?\*/}', '', line)
        
        # Clean up multiple spaces
        line = re.sub(r'  +', ' ', line)
        
        # Only add non-empty lines (or preserve intentional blank lines)
        if line.strip() or not result or result[-1].strip():
            result.append(line)
    
    # Clean up excessive blank lines
    output = '\n'.join(result)
    output = re.sub(r'\n{3,}', '\n\n', output)
    
    return output.strip()


def process_file(input_path: Path, output_path: Path):
    """Process a single file"""
    try:
        content = input_path.read_text(encoding='utf-8')
        converted = convert_mdx_to_md(content)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(converted, encoding='utf-8')
        print(f"Converted: {input_path} -> {output_path}", file=sys.stderr)
    except Exception as e:
        print(f"Error processing {input_path}: {e}", file=sys.stderr)


def process_directory(input_dir: Path, output_dir: Path):
    """Process all MDX files in a directory"""
    mdx_files = list(input_dir.rglob('*.mdx'))
    
    if not mdx_files:
        print(f"No .mdx files found in {input_dir}", file=sys.stderr)
        return
    
    print(f"Found {len(mdx_files)} MDX files", file=sys.stderr)
    
    for mdx_file in mdx_files:
        rel_path = mdx_file.relative_to(input_dir)
        output_path = output_dir / rel_path.with_suffix('.md')
        process_file(mdx_file, output_path)
    
    print(f"Converted {len(mdx_files)} files", file=sys.stderr)


def main():
    parser = argparse.ArgumentParser(
        description="Convert MDX files to clean Markdown",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  mdx_to_md.py input.mdx output.md
  mdx_to_md.py input.mdx                    # outputs to stdout
  mdx_to_md.py --dir ./mdx-docs ./md-docs   # batch convert directory
"""
    )
    
    parser.add_argument("input", nargs="?", help="Input MDX file")
    parser.add_argument("output", nargs="?", help="Output MD file (default: stdout)")
    parser.add_argument("--dir", "-d", nargs=2, metavar=("INPUT_DIR", "OUTPUT_DIR"),
                        help="Convert all MDX files in a directory")
    
    args = parser.parse_args()
    
    if args.dir:
        input_dir, output_dir = args.dir
        process_directory(Path(input_dir), Path(output_dir))
    elif args.input:
        input_path = Path(args.input)
        content = input_path.read_text(encoding='utf-8')
        converted = convert_mdx_to_md(content)
        
        if args.output:
            Path(args.output).write_text(converted, encoding='utf-8')
            print(f"Converted: {args.input} -> {args.output}", file=sys.stderr)
        else:
            print(converted)
    else:
        # Read from stdin
        content = sys.stdin.read()
        print(convert_mdx_to_md(content))


if __name__ == "__main__":
    main()
