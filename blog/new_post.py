from __future__ import annotations
import argparse
import datetime
import os
import re
import subprocess
import sys
from pathlib import Path

POSTS_DIR = Path(__file__).resolve().parent / 'posts'
POSTS_JSON = Path(__file__).resolve().parent / 'posts.json'

METADATA_TEMPLATE = '''---
title: {title}
date: {date}
tags: [{tags}]
subtitle: "A short, snappy hook for the reader."
hero_image: "../images/placeholder.jpg"
---

Write your content here. Use images to break it up:
![Optional caption](../images/placeholder.jpg)

## So what are you waiting for?

Get started with your next big idea today.
'''


def slugify(text: str) -> str:
    slug = re.sub(r'[^a-z0-9]+', '-', text.lower())
    slug = slug.strip('-')
    return slug or 'post'


def ensure_posts_dir() -> None:
    POSTS_DIR.mkdir(parents=True, exist_ok=True)


def read_posts_json() -> list[dict[str, object]]:
    if not POSTS_JSON.exists():
        return []
    import json
    return json.loads(POSTS_JSON.read_text(encoding='utf-8'))


def write_posts_json(posts: list[dict[str, object]]) -> None:
    import json
    POSTS_JSON.write_text(json.dumps(posts, indent=2), encoding='utf-8')


def create_post(title: str, tags: list[str]) -> Path:
    ensure_posts_dir()
    date = datetime.date.today().isoformat()
    slug = slugify(title)
    filename = f"{date}-{slug}.md"
    filepath = POSTS_DIR / filename
    metadata = METADATA_TEMPLATE.format(
        title=title,
        date=date,
        tags=', '.join(f'"{tag.strip()}"' for tag in tags),
    )
    if filepath.exists():
        raise FileExistsError(f'Post already exists: {filepath}')
    filepath.write_text(metadata, encoding='utf-8')
    return filepath


def add_to_index(title: str, slug: str, date: str, tags: list[str]) -> None:
    posts = read_posts_json()
    posts.append({
        'slug': slug,
        'title': title,
        'date': date,
        'excerpt': 'Write a short summary of this post.',
        'tags': tags,
    })
    posts.sort(key=lambda item: item['date'], reverse=True)
    write_posts_json(posts)


def launch_editor(filepath: Path) -> None:
    try:
        os.startfile(filepath)
    except Exception:
        pass


def regenerate_share_shells() -> None:
    """Re-run gen_posts.py so the new post gets a /p/<slug>.html shell with
    correct OG tags before anyone shares it. Note: the markdown body is
    still empty at this point — re-run this again after writing content
    so the og:description picks up the real subtitle."""
    gen_script = Path(__file__).resolve().parent / 'gen_posts.py'
    subprocess.run([sys.executable, str(gen_script)], check=True)


def main() -> None:
    parser = argparse.ArgumentParser(description='Create a new blog post.')
    parser.add_argument('title', help='Title of the new post')
    parser.add_argument('--tags', default='', help='Comma-separated tags')
    args = parser.parse_args()

    tags = [tag.strip() for tag in args.tags.split(',') if tag.strip()]
    filepath = create_post(args.title, tags)
    date = datetime.date.today().isoformat()
    slug = re.sub(r'[^a-z0-9]+', '-', args.title.lower()).strip('-') or 'post'
    add_to_index(args.title, slug, date, tags)
    regenerate_share_shells()
    print(f'Created new post: {filepath}')
    print('Open it in your editor to start writing.')
    print('Re-run gen_posts.py after writing to refresh the share preview text.')
    launch_editor(filepath)


if __name__ == '__main__':
    main()
