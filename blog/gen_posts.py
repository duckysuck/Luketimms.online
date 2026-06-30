"""Generate per-post static HTML shells so social scrapers see the right
Open Graph tags on shares of blog.luketimms.online.

For each entry in posts.json this writes blog/p/<slug>.html — a copy of
post.html with og:title / og:description / og:image / canonical baked
into <head> at HTML-load time, and an inline window.__SLUG__ so blog.js
hydrates the right post.

Re-run after adding or editing a post.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

BLOG_DIR = Path(__file__).resolve().parent
POSTS_DIR = BLOG_DIR / 'posts'
POSTS_JSON = BLOG_DIR / 'posts.json'
SHELLS_DIR = BLOG_DIR / 'p'

SITE_ORIGIN = 'https://blog.luketimms.online'
DEFAULT_OG_IMAGE = f'{SITE_ORIGIN}/og-banner.png'


def parse_frontmatter(text: str) -> dict[str, str]:
    match = re.match(r'^---\r?\n(.+?)\r?\n---\r?\n', text, re.DOTALL)
    if not match:
        return {}
    out: dict[str, str] = {}
    for line in match.group(1).splitlines():
        if ':' not in line:
            continue
        key, _, value = line.partition(':')
        value = value.strip()
        if (value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'")):
            value = value[1:-1]
        out[key.strip()] = value
    return out


def html_escape(value: str) -> str:
    return (
        value.replace('&', '&amp;')
             .replace('<', '&lt;')
             .replace('>', '&gt;')
             .replace('"', '&quot;')
    )


SHELL_TEMPLATE = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title} — Lukes Blog</title>
  <meta name="description" content="{description}" />
  <link rel="canonical" href="{canonical}" />

  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Lukes Blog" />
  <meta property="og:title" content="{title}" />
  <meta property="og:description" content="{description}" />
  <meta property="og:image" content="{og_image}" />
  <meta property="og:url" content="{canonical}" />
  <meta property="article:published_time" content="{published}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{title}" />
  <meta name="twitter:description" content="{description}" />
  <meta name="twitter:image" content="{og_image}" />

  <link rel="stylesheet" href="../style.css" />
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
</head>
<body>
  <header class="post-header">
    <a class="back-link" href="../index.html">← Back to Lukes Blog</a>
    <div id="postMeta"></div>
  </header>

  <div class="share-slot"></div>

  <div id="heroContainer" class="hero-full-width"></div>

  <main class="post-main">
    <div class="post-article-container">
      <article id="postContent" class="post-content"></article>
      <div class="share-slot"></div>
    </div>
    <aside class="sidebar">
      <div class="ad-card yt-channel-card">
        <p class="ad-label">Recommended</p>
        <img class="yt-avatar" src="https://yt3.googleusercontent.com/e-gBcJCLDmMNoA7vnExQh3LhSU6QcYeBwwwmDhj_YSM10-qP9LurtDmpB1qUwk3S9f2PLRQwRqM=s160-c-k-c0x00ffffff-no-rj" alt="Game Production Podcast" />
        <h3>Game Production Podcast</h3>
        <p>Expert insights into the business and craft of game development.</p>
        <a href="https://www.youtube.com/@GameProdPod" target="_blank" class="meta" style="text-decoration: underline; color: var(--accent-alt);">Watch on YouTube →</a>
      </div>

      <div id="jokeAdSlot"></div>

      <a href="https://amzn.to/4whcSEr" class="ad-card ad-card-image" target="_blank" rel="sponsored noopener">
        <p class="ad-label">Amazon Pick</p>
        <img src="https://m.media-amazon.com/images/I/61GoFlTg3IL._AC_SX522_.jpg" alt="roborock Saros 20 robot vacuum and mop" />
        <h3>Roborock Saros 20</h3>
        <p>Robot vacuum + mop, 36,000 Pa suction, hot-water mop care. £999.</p>
      </a>

      <a href="https://amzn.to/4aWyRZ6" class="ad-card ad-card-image" target="_blank" rel="sponsored noopener">
        <p class="ad-label">Amazon Pick</p>
        <img src="https://m.media-amazon.com/images/I/811J8urmwwL._AC_SX522_.jpg" alt="Ninja Luxe Premier coffee machine" />
        <h3>Ninja Luxe Premier</h3>
        <p>3-in-1 espresso, latte & cold brew, built-in grinder. £549.99.</p>
      </a>

      <div class="ad-card">
        <p class="ad-label">Sponsored</p>
        <h3>Blog as a Service</h3>
        <p>Want a blog like this?</p>
      </div>

      <p class="affiliate-disclosure">As an Amazon Associate I earn from qualifying purchases.</p>
    </aside>
  </main>

  <footer class="site-footer">
    <p>&copy; 2026 Lukes Blog. All rights reserved.</p>
  </footer>

  <script>window.__SLUG__ = {slug_js};</script>
  <script src="../blog.js"></script>
</body>
</html>
'''


def render_shell(post: dict[str, object], frontmatter: dict[str, str]) -> str:
    slug = str(post['slug'])
    description = frontmatter.get('subtitle') or str(post.get('excerpt', ''))
    return SHELL_TEMPLATE.format(
        title=html_escape(str(post['title'])),
        description=html_escape(description),
        canonical=f'{SITE_ORIGIN}/p/{slug}.html',
        og_image=DEFAULT_OG_IMAGE,
        published=str(post.get('date', '')),
        slug_js=json.dumps(slug),
    )


def main() -> None:
    SHELLS_DIR.mkdir(exist_ok=True)
    posts = json.loads(POSTS_JSON.read_text(encoding='utf-8'))
    written = 0
    for post in posts:
        slug = str(post['slug'])
        date = str(post['date'])
        md_path = POSTS_DIR / f'{date}-{slug}.md'
        frontmatter: dict[str, str] = {}
        if md_path.exists():
            frontmatter = parse_frontmatter(md_path.read_text(encoding='utf-8'))
        else:
            print(f'  warn: missing markdown for {slug} (expected {md_path.name})')

        out_path = SHELLS_DIR / f'{slug}.html'
        out_path.write_text(render_shell(post, frontmatter), encoding='utf-8')
        written += 1
        print(f'  wrote p/{slug}.html')

    print(f'Generated {written} shells in {SHELLS_DIR}')


if __name__ == '__main__':
    main()
