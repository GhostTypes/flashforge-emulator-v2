#!/usr/bin/env python3
"""
HTML to Markdown converter.
Cleans HTML documentation and converts to clean Markdown format.

Usage:
  html_to_md.py <input.html> [output.md]
  html_to_md.py --dir <input_dir> <output_dir>
"""

import sys
import re
import argparse
from pathlib import Path

try:
    from bs4 import BeautifulSoup
    HAS_BS4 = True
except ImportError:
    HAS_BS4 = False

try:
    from markdownify import markdownify as md
    HAS_MARKDOWNIFY = True
except ImportError:
    HAS_MARKDOWNIFY = False


def check_dependencies():
    """Check for required dependencies"""
    missing = []
    if not HAS_BS4:
        missing.append("beautifulsoup4")
    if not HAS_MARKDOWNIFY:
        missing.append("markdownify")
    
    if missing:
        print("Missing dependencies. Install with:", file=sys.stderr)
        print(f"  pip install {' '.join(missing)} --break-system-packages", file=sys.stderr)
        return False
    return True


def convert_html_to_md(content: str, keep_structure: bool = True) -> str:
    """
    Convert HTML content to clean Markdown.
    
    Args:
        content: HTML content string
        keep_structure: If True, try to preserve document structure
    
    Returns:
        Cleaned Markdown content
    """
    if not HAS_BS4 or not HAS_MARKDOWNIFY:
        # Fallback: basic regex-based conversion
        return basic_html_to_md(content)
    
    soup = BeautifulSoup(content, 'html.parser')
    
    # Remove unwanted elements
    unwanted_tags = [
        'script', 'style', 'noscript', 'iframe', 'svg', 'meta', 'link',
        'nav', 'footer', 'header', 'aside', 'form', 'button', 'input',
        'select', 'textarea'
    ]
    for tag in soup(unwanted_tags):
        tag.decompose()
    
    # Remove common navigation/utility elements by class/id
    unwanted_selectors = [
        '.sidebar', '.navigation', '.nav', '.menu', '.header', '.footer',
        '.ads', '.advertisement', '.cookie', '.modal', '.popup', '.overlay',
        '.toc', '.table-of-contents', '.breadcrumb', '.pagination',
        '.social', '.share', '.comments', '.related', '.recommended',
        '#sidebar', '#nav', '#navigation', '#header', '#footer',
        '#cookie-banner', '#modal', '[role="navigation"]', '[role="banner"]',
        '[role="contentinfo"]', '.skip-link', '.sr-only', '.visually-hidden'
    ]
    for selector in unwanted_selectors:
        for element in soup.select(selector):
            element.decompose()
    
    # Try to find the main content area
    main_content = None
    content_selectors = [
        'main', 'article', '.content', '.main-content', '.post-content',
        '.article-content', '.documentation', '.docs-content', '#content',
        '#main', '[role="main"]'
    ]
    for selector in content_selectors:
        main_content = soup.select_one(selector)
        if main_content:
            break
    
    # Use main content if found, otherwise use body or full soup
    if main_content:
        html_to_convert = str(main_content)
    elif soup.body:
        html_to_convert = str(soup.body)
    else:
        html_to_convert = str(soup)
    
    # Convert to markdown
    markdown_content = md(
        html_to_convert,
        heading_style="ATX",
        bullets="-",
        code_language_callback=lambda el: el.get('class', [''])[0].replace('language-', '') if el.get('class') else ''
    )
    
    # Clean up the output
    markdown_content = clean_markdown(markdown_content)
    
    return markdown_content


def basic_html_to_md(content: str) -> str:
    """Basic HTML to Markdown conversion using regex (fallback)"""
    
    # Remove script and style tags
    content = re.sub(r'<script[^>]*>.*?</script>', '', content, flags=re.DOTALL | re.IGNORECASE)
    content = re.sub(r'<style[^>]*>.*?</style>', '', content, flags=re.DOTALL | re.IGNORECASE)
    
    # Headers
    content = re.sub(r'<h1[^>]*>(.*?)</h1>', r'# \1\n', content, flags=re.DOTALL | re.IGNORECASE)
    content = re.sub(r'<h2[^>]*>(.*?)</h2>', r'## \1\n', content, flags=re.DOTALL | re.IGNORECASE)
    content = re.sub(r'<h3[^>]*>(.*?)</h3>', r'### \1\n', content, flags=re.DOTALL | re.IGNORECASE)
    content = re.sub(r'<h4[^>]*>(.*?)</h4>', r'#### \1\n', content, flags=re.DOTALL | re.IGNORECASE)
    content = re.sub(r'<h5[^>]*>(.*?)</h5>', r'##### \1\n', content, flags=re.DOTALL | re.IGNORECASE)
    content = re.sub(r'<h6[^>]*>(.*?)</h6>', r'###### \1\n', content, flags=re.DOTALL | re.IGNORECASE)
    
    # Paragraphs and line breaks
    content = re.sub(r'<p[^>]*>(.*?)</p>', r'\1\n\n', content, flags=re.DOTALL | re.IGNORECASE)
    content = re.sub(r'<br\s*/?>', '\n', content, flags=re.IGNORECASE)
    
    # Links
    content = re.sub(r'<a[^>]*href=["\']([^"\']*)["\'][^>]*>(.*?)</a>', r'[\2](\1)', content, flags=re.DOTALL | re.IGNORECASE)
    
    # Bold and italic
    content = re.sub(r'<(strong|b)[^>]*>(.*?)</\1>', r'**\2**', content, flags=re.DOTALL | re.IGNORECASE)
    content = re.sub(r'<(em|i)[^>]*>(.*?)</\1>', r'*\2*', content, flags=re.DOTALL | re.IGNORECASE)
    
    # Code
    content = re.sub(r'<code[^>]*>(.*?)</code>', r'`\1`', content, flags=re.DOTALL | re.IGNORECASE)
    content = re.sub(r'<pre[^>]*>(.*?)</pre>', r'```\n\1\n```\n', content, flags=re.DOTALL | re.IGNORECASE)
    
    # Lists
    content = re.sub(r'<li[^>]*>(.*?)</li>', r'- \1\n', content, flags=re.DOTALL | re.IGNORECASE)
    content = re.sub(r'</?[uo]l[^>]*>', '', content, flags=re.IGNORECASE)
    
    # Images
    content = re.sub(r'<img[^>]*src=["\']([^"\']*)["\'][^>]*alt=["\']([^"\']*)["\'][^>]*/?>', r'![\2](\1)', content, flags=re.IGNORECASE)
    content = re.sub(r'<img[^>]*src=["\']([^"\']*)["\'][^>]*/?>', r'![image](\1)', content, flags=re.IGNORECASE)
    
    # Remove remaining HTML tags
    content = re.sub(r'<[^>]+>', '', content)
    
    # Decode HTML entities
    content = content.replace('&nbsp;', ' ')
    content = content.replace('&lt;', '<')
    content = content.replace('&gt;', '>')
    content = content.replace('&amp;', '&')
    content = content.replace('&quot;', '"')
    content = content.replace('&#39;', "'")
    
    return clean_markdown(content)


def clean_markdown(content: str) -> str:
    """Clean up markdown content"""
    
    # Remove excessive whitespace
    content = re.sub(r' +', ' ', content)
    content = re.sub(r'\n{3,}', '\n\n', content)
    
    # Fix list formatting
    content = re.sub(r'\n- ', '\n\n- ', content)
    content = re.sub(r'\n{3,}- ', '\n\n- ', content)
    
    # Clean up heading spacing
    content = re.sub(r'\n(#{1,6} )', r'\n\n\1', content)
    content = re.sub(r'(#{1,6} [^\n]+)\n([^\n])', r'\1\n\n\2', content)
    
    # Remove leading/trailing whitespace from lines
    lines = [line.rstrip() for line in content.split('\n')]
    content = '\n'.join(lines)
    
    # Clean up start and end
    content = content.strip()
    
    return content


def process_file(input_path: Path, output_path: Path):
    """Process a single file"""
    try:
        content = input_path.read_text(encoding='utf-8', errors='ignore')
        converted = convert_html_to_md(content)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(converted, encoding='utf-8')
        print(f"Converted: {input_path} -> {output_path}", file=sys.stderr)
    except Exception as e:
        print(f"Error processing {input_path}: {e}", file=sys.stderr)


def process_directory(input_dir: Path, output_dir: Path):
    """Process all HTML files in a directory"""
    html_files = list(input_dir.rglob('*.html')) + list(input_dir.rglob('*.htm'))
    
    if not html_files:
        print(f"No .html files found in {input_dir}", file=sys.stderr)
        return
    
    print(f"Found {len(html_files)} HTML files", file=sys.stderr)
    
    for html_file in html_files:
        rel_path = html_file.relative_to(input_dir)
        output_path = output_dir / rel_path.with_suffix('.md')
        process_file(html_file, output_path)
    
    print(f"Converted {len(html_files)} files", file=sys.stderr)


def main():
    parser = argparse.ArgumentParser(
        description="Convert HTML files to clean Markdown",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  html_to_md.py input.html output.md
  html_to_md.py input.html                    # outputs to stdout
  html_to_md.py --dir ./html-docs ./md-docs   # batch convert directory
"""
    )
    
    parser.add_argument("input", nargs="?", help="Input HTML file")
    parser.add_argument("output", nargs="?", help="Output MD file (default: stdout)")
    parser.add_argument("--dir", "-d", nargs=2, metavar=("INPUT_DIR", "OUTPUT_DIR"),
                        help="Convert all HTML files in a directory")
    
    args = parser.parse_args()
    
    if args.dir:
        input_dir, output_dir = args.dir
        process_directory(Path(input_dir), Path(output_dir))
    elif args.input:
        if not check_dependencies():
            print("Using basic conversion (install dependencies for better results)", file=sys.stderr)
        
        input_path = Path(args.input)
        content = input_path.read_text(encoding='utf-8', errors='ignore')
        converted = convert_html_to_md(content)
        
        if args.output:
            Path(args.output).write_text(converted, encoding='utf-8')
            print(f"Converted: {args.input} -> {args.output}", file=sys.stderr)
        else:
            print(converted)
    else:
        # Read from stdin
        content = sys.stdin.read()
        print(convert_html_to_md(content))


if __name__ == "__main__":
    main()
