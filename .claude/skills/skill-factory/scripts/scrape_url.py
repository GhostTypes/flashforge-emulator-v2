#!/usr/bin/env python3
"""
Web scraper using cloudscraper to bypass Cloudflare protection.
Converts HTML to clean markdown format.
Supports single URL, batch mode, and crawl mode.

Usage: 
  scrape_url.py <url> [output_file]
  scrape_url.py --batch <urls_file> <output_dir>
  scrape_url.py --crawl <base_url> <output_dir> [--max-pages N]
"""

import sys
import os
import re
import time
import argparse
from pathlib import Path
from urllib.parse import urljoin, urlparse
from typing import Set, List, Optional

try:
    import cloudscraper
    HAS_CLOUDSCRAPER = True
except ImportError:
    HAS_CLOUDSCRAPER = False

try:
    from markdownify import markdownify as md
    HAS_MARKDOWNIFY = True
except ImportError:
    HAS_MARKDOWNIFY = False

try:
    from bs4 import BeautifulSoup
    HAS_BS4 = True
except ImportError:
    HAS_BS4 = False

# Hop-by-hop headers that should be removed
HOP_BY_HOP_HEADERS = {
    'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization',
    'te', 'trailers', 'transfer-encoding', 'upgrade',
}

def check_dependencies():
    """Check for required dependencies"""
    missing = []
    if not HAS_CLOUDSCRAPER:
        missing.append("cloudscraper")
    if not HAS_MARKDOWNIFY:
        missing.append("markdownify")
    if not HAS_BS4:
        missing.append("beautifulsoup4")
    
    if missing:
        print("Missing dependencies. Install with:", file=sys.stderr)
        print(f"  pip install {' '.join(missing)} brotli --break-system-packages", file=sys.stderr)
        return False
    return True

def get_headers():
    """Get default headers for requests"""
    return {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none'
    }

def generate_origin_and_ref(url):
    """Generate origin and referrer from URL"""
    parts = url.split('/')
    protocol = parts[0]
    domain = parts[2]
    base_url = f"{protocol}//{domain}/"
    return base_url, base_url

def clean_html_to_markdown(html_content: str) -> str:
    """Convert HTML content to clean markdown format"""
    if not HAS_MARKDOWNIFY or not HAS_BS4:
        return html_content
    
    try:
        # Parse with BeautifulSoup first to clean up
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Remove unwanted elements
        for tag in soup(['script', 'style', 'nav', 'footer', 'header', 'aside', 
                         'iframe', 'noscript', 'svg', 'meta', 'link']):
            tag.decompose()
        
        # Remove elements with these classes/ids (common navigation/sidebar patterns)
        for selector in ['.sidebar', '.navigation', '.nav', '.menu', '.header', 
                        '.footer', '.ads', '.advertisement', '#sidebar', '#nav',
                        '.toc', '.table-of-contents', '.breadcrumb']:
            for element in soup.select(selector):
                element.decompose()
        
        # Convert to markdown
        markdown_content = md(str(soup), heading_style="ATX", bullets="-")
        
        # Clean up excessive whitespace
        markdown_content = re.sub(r'\n{3,}', '\n\n', markdown_content)
        markdown_content = re.sub(r' +', ' ', markdown_content)
        
        return markdown_content.strip()
    except Exception as e:
        print(f"Warning: Error converting HTML to markdown: {str(e)}", file=sys.stderr)
        return html_content

def create_scraper():
    """Create a cloudscraper instance"""
    if not HAS_CLOUDSCRAPER:
        return None
    
    return cloudscraper.create_scraper(
        browser={
            'browser': 'chrome',
            'platform': 'windows',
            'desktop': True
        },
        delay=1,
        allow_brotli=True
    )

def scrape_url(url: str, scraper=None, clean_content: bool = True) -> Optional[str]:
    """
    Scrape a URL using cloudscraper to bypass Cloudflare protection.
    
    Args:
        url: The URL to scrape
        scraper: Optional reusable scraper instance
        clean_content: Whether to convert HTML to markdown (default: True)
    
    Returns:
        String containing the page content
    """
    if scraper is None:
        scraper = create_scraper()
    
    if scraper is None:
        print("Error: cloudscraper not available", file=sys.stderr)
        return None
    
    # Prepare headers
    headers = get_headers()
    origin, ref = generate_origin_and_ref(url)
    headers['Origin'] = origin
    headers['Referer'] = ref
    
    try:
        # Make the request
        response = scraper.get(url, headers=headers, stream=False, timeout=30)
        response.raise_for_status()
        
        # Get content type
        content_type = response.headers.get('content-type', '')
        
        # Handle different content types
        if 'text' in content_type or 'html' in content_type:
            content = response.text
            # Clean HTML to markdown if requested
            if clean_content and 'html' in content_type:
                content = clean_html_to_markdown(content)
        else:
            # For binary content, try to decode as UTF-8
            try:
                content = response.content.decode('utf-8')
            except UnicodeDecodeError:
                return f"[Binary content - {len(response.content)} bytes - Content-Type: {content_type}]"
        
        return content
    except Exception as e:
        print(f"Error scraping {url}: {str(e)}", file=sys.stderr)
        return None

def extract_links(html_content: str, base_url: str, path_prefix: str = None) -> Set[str]:
    """Extract links from HTML content"""
    if not HAS_BS4:
        return set()
    
    links = set()
    soup = BeautifulSoup(html_content, 'html.parser')
    parsed_base = urlparse(base_url)
    
    for a_tag in soup.find_all('a', href=True):
        href = a_tag['href']
        
        # Skip anchors and javascript
        if href.startswith('#') or href.startswith('javascript:'):
            continue
        
        # Convert relative URLs to absolute
        full_url = urljoin(base_url, href)
        parsed_url = urlparse(full_url)
        
        # Only follow same-domain links
        if parsed_url.netloc != parsed_base.netloc:
            continue
        
        # Apply path prefix filter if specified
        if path_prefix and not parsed_url.path.startswith(path_prefix):
            continue
        
        # Remove fragment
        clean_url = f"{parsed_url.scheme}://{parsed_url.netloc}{parsed_url.path}"
        if parsed_url.query:
            clean_url += f"?{parsed_url.query}"
        
        links.add(clean_url)
    
    return links

def url_to_filename(url: str, output_dir: Path) -> Path:
    """Convert a URL to a safe filename"""
    parsed = urlparse(url)
    path = parsed.path.strip('/')
    
    if not path:
        path = "index"
    
    # Replace slashes with underscores
    filename = path.replace('/', '_')
    
    # Remove or replace unsafe characters
    filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
    
    # Ensure it ends with .md
    if not filename.endswith('.md'):
        filename += '.md'
    
    return output_dir / filename

def crawl_site(base_url: str, output_dir: Path, max_pages: int = 50, delay: float = 1.0):
    """Crawl a site starting from base_url"""
    output_dir.mkdir(parents=True, exist_ok=True)
    
    scraper = create_scraper()
    if scraper is None:
        return
    
    # Determine path prefix from base URL
    parsed = urlparse(base_url)
    path_prefix = parsed.path.rstrip('/')
    if not path_prefix:
        path_prefix = None
    
    visited: Set[str] = set()
    to_visit: List[str] = [base_url]
    
    print(f"Crawling {base_url}", file=sys.stderr)
    print(f"Output directory: {output_dir}", file=sys.stderr)
    print(f"Max pages: {max_pages}", file=sys.stderr)
    if path_prefix:
        print(f"Path prefix: {path_prefix}", file=sys.stderr)
    print("-" * 40, file=sys.stderr)
    
    while to_visit and len(visited) < max_pages:
        url = to_visit.pop(0)
        
        if url in visited:
            continue
        
        print(f"[{len(visited)+1}/{max_pages}] {url}", file=sys.stderr)
        
        # Fetch the raw HTML first (for link extraction)
        headers = get_headers()
        origin, ref = generate_origin_and_ref(url)
        headers['Origin'] = origin
        headers['Referer'] = ref
        
        try:
            response = scraper.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            html_content = response.text
        except Exception as e:
            print(f"  Error: {str(e)}", file=sys.stderr)
            visited.add(url)
            continue
        
        # Extract links before converting to markdown
        new_links = extract_links(html_content, url, path_prefix)
        for link in new_links:
            if link not in visited and link not in to_visit:
                to_visit.append(link)
        
        # Convert to markdown
        markdown_content = clean_html_to_markdown(html_content)
        
        # Save to file
        output_file = url_to_filename(url, output_dir)
        output_file.write_text(f"# Source: {url}\n\n{markdown_content}", encoding='utf-8')
        
        visited.add(url)
        
        # Rate limiting
        if delay > 0:
            time.sleep(delay)
    
    print("-" * 40, file=sys.stderr)
    print(f"Crawled {len(visited)} pages", file=sys.stderr)

def batch_scrape(urls_file: Path, output_dir: Path, delay: float = 1.0):
    """Scrape multiple URLs from a file"""
    output_dir.mkdir(parents=True, exist_ok=True)
    
    if not urls_file.exists():
        print(f"Error: URLs file not found: {urls_file}", file=sys.stderr)
        return
    
    urls = [line.strip() for line in urls_file.read_text().splitlines() if line.strip() and not line.startswith('#')]
    
    print(f"Scraping {len(urls)} URLs", file=sys.stderr)
    print(f"Output directory: {output_dir}", file=sys.stderr)
    print("-" * 40, file=sys.stderr)
    
    scraper = create_scraper()
    
    for i, url in enumerate(urls, 1):
        print(f"[{i}/{len(urls)}] {url}", file=sys.stderr)
        
        content = scrape_url(url, scraper)
        if content:
            output_file = url_to_filename(url, output_dir)
            output_file.write_text(f"# Source: {url}\n\n{content}", encoding='utf-8')
        
        if delay > 0 and i < len(urls):
            time.sleep(delay)
    
    print("-" * 40, file=sys.stderr)
    print(f"Completed scraping {len(urls)} URLs", file=sys.stderr)

def main():
    parser = argparse.ArgumentParser(
        description="Web scraper with Cloudflare bypass. Converts HTML to markdown.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Single URL
  scrape_url.py https://example.com
  scrape_url.py https://example.com output.md

  # Batch mode - scrape URLs from a file
  scrape_url.py --batch urls.txt ./docs/

  # Crawl mode - recursively scrape a docs section
  scrape_url.py --crawl https://docs.example.com/guide/ ./docs/ --max-pages 50
"""
    )
    
    parser.add_argument("url_or_file", nargs="?", help="URL to scrape or file containing URLs (in batch mode)")
    parser.add_argument("output", nargs="?", help="Output file or directory")
    parser.add_argument("--batch", "-b", metavar="URLS_FILE", help="Batch mode: scrape URLs from a file")
    parser.add_argument("--crawl", "-c", metavar="BASE_URL", help="Crawl mode: recursively scrape starting from URL")
    parser.add_argument("--max-pages", "-m", type=int, default=50, help="Max pages to crawl (default: 50)")
    parser.add_argument("--delay", "-d", type=float, default=1.0, help="Delay between requests in seconds (default: 1.0)")
    parser.add_argument("--raw", "-r", action="store_true", help="Output raw HTML without converting to markdown")
    
    args = parser.parse_args()
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Handle different modes
    if args.crawl:
        if not args.output:
            print("Error: Output directory required for crawl mode", file=sys.stderr)
            sys.exit(1)
        crawl_site(args.crawl, Path(args.output), args.max_pages, args.delay)
    
    elif args.batch:
        if not args.output:
            print("Error: Output directory required for batch mode", file=sys.stderr)
            sys.exit(1)
        batch_scrape(Path(args.batch), Path(args.output), args.delay)
    
    elif args.url_or_file:
        # Single URL mode
        url = args.url_or_file
        content = scrape_url(url, clean_content=not args.raw)
        
        if content:
            if args.output:
                Path(args.output).write_text(content, encoding='utf-8')
                print(f"Content saved to {args.output}", file=sys.stderr)
            else:
                print(content)
    
    else:
        parser.print_help()
        sys.exit(1)

if __name__ == "__main__":
    main()
