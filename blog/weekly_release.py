"""Weekly Tuesday-evening release: pops the next post off scheduled_posts.json,
publishes it with today's date, regenerates the OG shells, and pushes live.

Run by cron (see crontab -l). Safe to run with an empty queue — it just exits.
"""
from __future__ import annotations

import datetime
import json
import re
import subprocess
import sys
from pathlib import Path

BLOG_DIR = Path(__file__).resolve().parent
POSTS_DIR = BLOG_DIR / 'posts'
POSTS_JSON = BLOG_DIR / 'posts.json'
SCHEDULED_JSON = BLOG_DIR / 'scheduled_posts.json'
LIVE_CLONE = Path('/docker/luketimms-cv/repo')


def log(msg: str) -> None:
    print(f'[{datetime.datetime.now(datetime.timezone.utc).isoformat()}] {msg}')


def main() -> None:
    scheduled = json.loads(SCHEDULED_JSON.read_text(encoding='utf-8'))
    if not scheduled:
        log('No posts in queue. Nothing to release.')
        return

    next_post = scheduled.pop(0)
    today = datetime.date.today().isoformat()
    slug = next_post['slug']

    old_path = POSTS_DIR / f"{next_post['file_date']}-{slug}.md"
    new_path = POSTS_DIR / f"{today}-{slug}.md"
    if not old_path.exists():
        log(f'ERROR: expected markdown file not found: {old_path}')
        sys.exit(1)

    text = old_path.read_text(encoding='utf-8')
    text = re.sub(r'^date:\s*.*$', f'date: {today}', text, count=1, flags=re.MULTILINE)
    old_path.rename(new_path)
    new_path.write_text(text, encoding='utf-8')
    log(f'Renamed {old_path.name} -> {new_path.name}, updated frontmatter date.')

    posts = json.loads(POSTS_JSON.read_text(encoding='utf-8'))
    posts.append({
        'slug': slug,
        'title': next_post['title'],
        'date': today,
        'excerpt': next_post['excerpt'],
        'tags': next_post['tags'],
    })
    posts.sort(key=lambda item: item['date'], reverse=True)
    POSTS_JSON.write_text(json.dumps(posts, indent=2) + '\n', encoding='utf-8')
    SCHEDULED_JSON.write_text(json.dumps(scheduled, indent=2) + '\n', encoding='utf-8')
    log(f'Published "{next_post["title"]}" dated {today}. {len(scheduled)} post(s) left in queue.')

    subprocess.run([sys.executable, str(BLOG_DIR / 'gen_posts.py')], check=True, cwd=BLOG_DIR)

    repo_dir = BLOG_DIR.parent
    subprocess.run(['git', 'add', 'blog/posts.json', 'blog/scheduled_posts.json',
                     'blog/posts/', 'blog/p/'], check=True, cwd=repo_dir)
    subprocess.run(['git', 'commit', '-m', f'blog: weekly release - {next_post["title"]}'],
                    check=True, cwd=repo_dir)
    subprocess.run(['git', 'push', 'origin', 'main'], check=True, cwd=repo_dir)
    log('Pushed to origin/main.')

    if LIVE_CLONE.exists():
        subprocess.run(['git', 'pull', '--ff-only', 'origin', 'main'], check=True, cwd=LIVE_CLONE)
        log('Pulled on live serve clone. Deploy complete.')
    else:
        log(f'WARNING: live clone path {LIVE_CLONE} not found, deploy not completed.')


if __name__ == '__main__':
    main()
