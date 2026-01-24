#!/usr/bin/env python3
"""
reStructuredText to Markdown converter.
Converts RST documentation to clean Markdown format.

Usage:
  rst_to_md.py <input.rst> [output.md]
  rst_to_md.py --dir <input_dir> <output_dir>
"""

import sys
import re
import argparse
from pathlib import Path


def convert_rst_to_md(content: str) -> str:
    """
    Convert reStructuredText content to Markdown.
    
    Handles:
    - Headings (various underline styles)
    - Code blocks (:: and .. code-block::)
    - Links and references
    - Lists
    - Directives (note, warning, etc.)
    - Inline formatting
    """
    lines = content.split('\n')
    result = []
    
    i = 0
    in_code_block = False
    code_indent = 0
    
    while i < len(lines):
        line = lines[i]
        
        # Handle code blocks with :: at end of line
        if line.rstrip().endswith('::') and not in_code_block:
            # Remove the :: and add the line
            result.append(line.rstrip()[:-2].rstrip())
            result.append('')
            result.append('```')
            in_code_block = True
            code_indent = 0
            i += 1
            # Skip blank line after ::
            if i < len(lines) and not lines[i].strip():
                i += 1
            # Determine indent level
            if i < len(lines):
                match = re.match(r'^(\s+)', lines[i])
                if match:
                    code_indent = len(match.group(1))
            continue
        
        # Handle .. code-block:: directive
        match = re.match(r'^\.\.\s+code-block::\s*(\w+)?', line)
        if match:
            lang = match.group(1) or ''
            result.append(f'```{lang}')
            in_code_block = True
            code_indent = 0
            i += 1
            # Skip blank lines and find indent
            while i < len(lines):
                if lines[i].strip():
                    match = re.match(r'^(\s+)', lines[i])
                    if match:
                        code_indent = len(match.group(1))
                    break
                i += 1
            continue
        
        # Handle code block content
        if in_code_block:
            # Check if we've left the code block (less indented or directive)
            if line.strip() and not line.startswith(' ' * max(1, code_indent)) and not line.startswith('\t'):
                result.append('```')
                result.append('')
                in_code_block = False
                # Don't increment i, process this line normally
            else:
                # Remove the code block indentation
                if line.strip():
                    if code_indent and line.startswith(' ' * code_indent):
                        line = line[code_indent:]
                result.append(line.rstrip())
                i += 1
                continue
        
        # Detect headings (line followed by underline)
        if i + 1 < len(lines) and line.strip():
            next_line = lines[i + 1]
            if next_line and len(next_line.strip()) >= len(line.strip()):
                if re.match(r'^[=]+$', next_line.strip()):
                    result.append(f'# {line.strip()}')
                    result.append('')
                    i += 2
                    continue
                elif re.match(r'^[-]+$', next_line.strip()):
                    result.append(f'## {line.strip()}')
                    result.append('')
                    i += 2
                    continue
                elif re.match(r'^[~]+$', next_line.strip()):
                    result.append(f'### {line.strip()}')
                    result.append('')
                    i += 2
                    continue
                elif re.match(r'^[\^]+$', next_line.strip()):
                    result.append(f'#### {line.strip()}')
                    result.append('')
                    i += 2
                    continue
                elif re.match(r'^["]+$', next_line.strip()):
                    result.append(f'##### {line.strip()}')
                    result.append('')
                    i += 2
                    continue
        
        # Handle directives (.. note::, .. warning::, etc.)
        match = re.match(r'^\.\.\s+(note|warning|tip|important|caution|danger|attention|hint|error)::', line)
        if match:
            directive_type = match.group(1).upper()
            result.append(f'> **{directive_type}**')
            i += 1
            # Get directive content (indented lines)
            while i < len(lines):
                if lines[i].strip() and not lines[i].startswith(' '):
                    break
                if lines[i].strip():
                    result.append(f'> {lines[i].strip()}')
                else:
                    result.append('>')
                i += 1
            result.append('')
            continue
        
        # Handle .. image:: and .. figure::
        match = re.match(r'^\.\.\s+(image|figure)::\s*(.+)', line)
        if match:
            img_path = match.group(2).strip()
            result.append(f'![image]({img_path})')
            i += 1
            # Skip image options
            while i < len(lines) and lines[i].startswith(' '):
                i += 1
            continue
        
        # Skip other directives (.. toctree::, etc.)
        if re.match(r'^\.\.\s+\w+::', line):
            i += 1
            while i < len(lines) and (lines[i].startswith(' ') or not lines[i].strip()):
                i += 1
            continue
        
        # Skip comment blocks (.. followed by indented content)
        if line.strip() == '..':
            i += 1
            while i < len(lines) and (lines[i].startswith(' ') or not lines[i].strip()):
                i += 1
            continue
        
        # Convert inline formatting
        line = convert_inline_formatting(line)
        
        result.append(line)
        i += 1
    
    # Close any unclosed code block
    if in_code_block:
        result.append('```')
    
    # Clean up
    output = '\n'.join(result)
    output = re.sub(r'\n{3,}', '\n\n', output)
    
    return output.strip()


def convert_inline_formatting(line: str) -> str:
    """Convert RST inline formatting to Markdown"""
    
    # Code literals: ``code`` -> `code`
    line = re.sub(r'``([^`]+)``', r'`\1`', line)
    
    # Bold: **text** -> **text** (same in MD)
    # Already compatible
    
    # Italic: *text* -> *text* (same in MD) 
    # Already compatible
    
    # Links: `text <url>`_ -> [text](url)
    line = re.sub(r'`([^<]+)\s+<([^>]+)>`_', r'[\1](\2)', line)
    
    # References: :ref:`label` -> [label](#label)
    line = re.sub(r':ref:`([^`]+)`', r'[\1](#\1)', line)
    
    # Doc references: :doc:`path` -> [path](path.md)
    line = re.sub(r':doc:`([^`]+)`', r'[\1](\1.md)', line)
    
    # Roles: :role:`content` -> `content`
    line = re.sub(r':\w+:`([^`]+)`', r'`\1`', line)
    
    # Inline literals: :literal:`text` -> `text`
    # Already handled above
    
    return line


def process_file(input_path: Path, output_path: Path):
    """Process a single file"""
    try:
        content = input_path.read_text(encoding='utf-8')
        converted = convert_rst_to_md(content)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(converted, encoding='utf-8')
        print(f"Converted: {input_path} -> {output_path}", file=sys.stderr)
    except Exception as e:
        print(f"Error processing {input_path}: {e}", file=sys.stderr)


def process_directory(input_dir: Path, output_dir: Path):
    """Process all RST files in a directory"""
    rst_files = list(input_dir.rglob('*.rst'))
    
    if not rst_files:
        print(f"No .rst files found in {input_dir}", file=sys.stderr)
        return
    
    print(f"Found {len(rst_files)} RST files", file=sys.stderr)
    
    for rst_file in rst_files:
        rel_path = rst_file.relative_to(input_dir)
        output_path = output_dir / rel_path.with_suffix('.md')
        process_file(rst_file, output_path)
    
    print(f"Converted {len(rst_files)} files", file=sys.stderr)


def main():
    parser = argparse.ArgumentParser(
        description="Convert reStructuredText files to Markdown",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  rst_to_md.py input.rst output.md
  rst_to_md.py input.rst                    # outputs to stdout
  rst_to_md.py --dir ./rst-docs ./md-docs   # batch convert directory
"""
    )
    
    parser.add_argument("input", nargs="?", help="Input RST file")
    parser.add_argument("output", nargs="?", help="Output MD file (default: stdout)")
    parser.add_argument("--dir", "-d", nargs=2, metavar=("INPUT_DIR", "OUTPUT_DIR"),
                        help="Convert all RST files in a directory")
    
    args = parser.parse_args()
    
    if args.dir:
        input_dir, output_dir = args.dir
        process_directory(Path(input_dir), Path(output_dir))
    elif args.input:
        input_path = Path(args.input)
        content = input_path.read_text(encoding='utf-8')
        converted = convert_rst_to_md(content)
        
        if args.output:
            Path(args.output).write_text(converted, encoding='utf-8')
            print(f"Converted: {args.input} -> {args.output}", file=sys.stderr)
        else:
            print(converted)
    else:
        # Read from stdin
        content = sys.stdin.read()
        print(convert_rst_to_md(content))


if __name__ == "__main__":
    main()
