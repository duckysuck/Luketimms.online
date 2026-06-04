Blog site
=========

What this folder contains
- `index.html` — blog homepage with post list and adverts.
- `post.html` — generic post viewer for markdown posts.
- `style.css` — site styling.
- `blog.js` — client-side loading of posts and markdown rendering.
- `posts.json` — site index of available blog posts.
- `posts/` — markdown content files.
- `new_post.py` — quick script to create a new post and register it in `posts.json`.

Create a new post quickly
- Run `python new_post.py "My New Title" --tags ai,blog,workflows`
- That creates a new post markdown file in `posts/` and adds it to `posts.json`.
- Edit the new file in your editor and refresh the browser.

Advert support
- The site includes advert sections on both the homepage and individual post pages.
- You can replace placeholder ad text with real promotions or embed ad units in `index.html` and `post.html`.

Notes
- The blog uses client-side markdown rendering with `marked.js`.
- If you want, I can also add a small `build.py` to generate static HTML files from the markdown posts.