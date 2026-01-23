#!/usr/bin/env python3
"""
electron-builder documentation scraper.

Discovers all documentation URLs from sitemap.xml, then scrapes them to markdown.
Based on web-scraper skill's scrape_url.py.

Usage: scrape_docs.py [output_dir]
"""

import sys
import os
import re
import time
from pathlib import Path
import cloudscraper
from markdownify import markdownify as md
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

# Base URL for electron-builder docs
BASE_URL = "https://www.electron.build/"

# Hop-by-hop headers that should be removed
HOP_BY_HOP_HEADERS = {
    'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization',
    'te', 'trailers', 'transfer-encoding', 'upgrade',
}

def clean_headers(headers):
    """Remove hop-by-hop headers"""
    cleaned = {}
    for name, value in headers.items():
        if name.lower() not in HOP_BY_HOP_HEADERS:
            cleaned[name] = value
    cleaned.pop('content-encoding', None)
    cleaned.pop('content-length', None)
    return cleaned

def get_headers():
    """Get default headers for requests"""
    return {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1'
    }

def clean_html_to_markdown(html_content, url=""):
    """Convert HTML content to clean markdown format, removing navigation chrome"""
    try:
        soup = BeautifulSoup(html_content, 'html.parser')

        # Remove navigation, header, footer elements
        for elem in soup.find_all(['nav', 'header', 'footer', 'aside']):
            elem.decompose()

        # Remove elements with common navigation/header class names
        for selector in [
            '[class*="nav"]', '[class*="header"]', '[class*="footer"]',
            '[class*="sidebar"]', '[class*="menu"]', '[id*="nav"]',
            '[id*="header"]', '[id*="footer"]', '[id*="sidebar"]',
            'md-header', 'md-sidebar', 'md-tabs', 'md-top'
        ]:
            for elem in soup.select(selector):
                # Be careful not to remove content divs
                if elem and elem.name not in ['main', 'article', 'div[role="main"]']:
                    elem.decompose()

        # Get the main content area
        main_content = soup.find('main') or soup.find('article') or soup.find('div', {'role': 'main'})
        if main_content:
            html_content = str(main_content)

        # Convert to markdown
        markdown_content = md(html_content, heading_style="ATX")

        # Clean up excessive whitespace
        markdown_content = re.sub(r'\n{3,}', '\n\n', markdown_content)
        markdown_content = markdown_content.strip()

        return markdown_content
    except Exception as e:
        print(f"Warning: Error converting HTML to markdown: {str(e)}", file=sys.stderr)
        return md(html_content, heading_style="ATX")

def scrape_url(scraper, url):
    """Scrape a URL using cloudscraper"""
    headers = get_headers()
    headers['Referer'] = BASE_URL

    try:
        response = scraper.get(url, headers=headers, timeout=30)
        content_type = response.headers.get('content-type', '')

        if 'text' in content_type or 'html' in content_type:
            return response.text
        else:
            print(f"Skipping {url} - non-text content: {content_type}", file=sys.stderr)
            return None
    except Exception as e:
        print(f"Error scraping {url}: {str(e)}", file=sys.stderr)
        return None

def discover_urls_from_sitemap(scraper):
    """Discover all documentation URLs from sitemap.xml"""
    urls = set()

    # Try sitemap.xml first
    sitemap_url = urljoin(BASE_URL, "sitemap.xml")
    print(f"Fetching sitemap from {sitemap_url}...", file=sys.stderr)

    try:
        sitemap_content = scrape_url(scraper, sitemap_url)
        if sitemap_content:
            soup = BeautifulSoup(sitemap_content, 'xml')
            for loc in soup.find_all('loc'):
                url = loc.get_text()
                # Filter for documentation pages
                if 'electron.build' in url and not any(ext in url for ext in ['.xml', '.json', '.txt']):
                    urls.add(url)
            print(f"Found {len(urls)} URLs in sitemap", file=sys.stderr)
            return sorted(urls)
    except Exception as e:
        print(f"Error parsing sitemap: {str(e)}", file=sys.stderr)

    # Fallback: parse the main page for links
    print("Sitemap not available, parsing main page for links...", file=sys.stderr)
    main_content = scrape_url(scraper, BASE_URL)
    if main_content:
        soup = BeautifulSoup(main_content, 'html.parser')
        for a in soup.find_all('a', href=True):
            href = a['href']
            full_url = urljoin(BASE_URL, href)
            # Include internal links that look like docs
            if 'electron.build' in full_url and not any(skip in full_url for skip in ['#', 'api.', 'github.com']):
                urls.add(full_url)

    return sorted(urls)

def slugify(url):
    """Convert URL to a safe filename"""
    parsed = urlparse(url)
    path = parsed.path.rstrip('/')
    if not path or path == '/':
        return 'index'

    # Remove .html extension
    path = re.sub(r'\.html$', '', path)

    # Remove leading slash and replace remaining slashes with hyphens
    path = path.lstrip('/')
    path = path.replace('/', '-')

    # Replace non-alphanumeric chars with hyphens
    path = re.sub(r'[^a-zA-Z0-9-]+', '-', path)
    path = path.strip('-')

    return path or 'index'

def main():
    output_dir = sys.argv[1] if len(sys.argv) > 1 else 'references'

    # Create output directory
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    # Initialize scraper
    scraper = cloudscraper.create_scraper(
        browser={'browser': 'chrome', 'platform': 'windows', 'desktop': True},
        delay=1,
        allow_brotli=True
    )

    # Discover all URLs
    urls = discover_urls_from_sitemap(scraper)

    if not urls:
        print("No URLs found to scrape", file=sys.stderr)
        sys.exit(1)

    print(f"Found {len(urls)} pages to scrape", file=sys.stderr)

    # Scrape each URL
    for i, url in enumerate(urls, 1):
        print(f"[{i}/{len(urls)}] Scraping {url}...", file=sys.stderr)

        html_content = scrape_url(scraper, url)
        if not html_content:
            continue

        # Convert to markdown
        markdown_content = clean_html_to_markdown(html_content, url)

        # Generate filename
        filename = slugify(url)
        if not filename.endswith('.md'):
            filename += '.md'

        # Write to file
        output_file = output_path / filename
        output_file.parent.mkdir(parents=True, exist_ok=True)

        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(f"# {url}\n\n")
            f.write(markdown_content)

        print(f"  -> Saved to {output_file}", file=sys.stderr)

        # Be polite - small delay between requests
        time.sleep(0.5)

    print(f"\nDone! Scraped {len(urls)} pages to {output_dir}", file=sys.stderr)

if __name__ == "__main__":
    main()
