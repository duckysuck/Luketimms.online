const SHARE_API = 'https://shares.tukems.cloud/share';

function trackShare(slug, platform) {
  try {
    fetch(SHARE_API, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ slug, platform }),
    });
  } catch (e) {
    // fire-and-forget; never block the actual share
  }
}

function renderShareButtons(slot, { slug, url, text, label }) {
  const links = {
    x: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    bluesky: `https://bsky.app/intent/compose?text=${encodeURIComponent(`${text} ${url}`)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    reddit: `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
  };

  const icons = {
    x: 'X',
    bluesky: '🦋',
    linkedin: 'in',
    reddit: 'reddit',
  };

  const copyLabel = '🔗 Copy link';

  slot.innerHTML = `
    <p class="share-label">${label}</p>
    <div class="share-buttons">
      ${Object.entries(links).map(([platform, href]) => `
        <a class="share-btn" href="${href}" target="_blank" rel="noopener" data-platform="${platform}" aria-label="Share on ${platform}">${icons[platform]}</a>
      `).join('')}
      <button class="share-btn share-btn-copy" data-platform="copy-link" aria-label="Copy link">${copyLabel}</button>
    </div>
  `;

  slot.querySelectorAll('[data-platform]').forEach(el => {
    el.addEventListener('click', (e) => {
      const platform = el.dataset.platform;
      trackShare(slug, platform);
      if (platform === 'copy-link') {
        e.preventDefault();
        navigator.clipboard.writeText(url).then(() => {
          el.textContent = '✓ Copied!';
          setTimeout(() => { el.textContent = copyLabel; }, 1500);
        });
      }
    });
  });
}

function renderShareRow(post) {
  document.querySelectorAll('.share-slot').forEach(slot => {
    renderShareButtons(slot, {
      slug: post.slug,
      url: `https://blog.luketimms.online/p/${encodeURIComponent(post.slug)}.html`,
      text: post.title,
      label: 'SHARE THIS',
    });
  });
}

function renderHomeShareRow() {
  document.querySelectorAll('.share-slot').forEach(slot => {
    renderShareButtons(slot, {
      slug: 'index',
      url: 'https://blog.luketimms.online/',
      text: 'Lukes Blog — Brain farts to tangible outcomes.',
      label: 'SHARE THIS',
    });
  });
}

async function loadJson(url) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Failed to load ${url}: ${response.status}`);
  return response.json();
}

function createPostCard(post) {
  const card = document.createElement('div');
  card.className = 'post-card';
  card.innerHTML = `
    <h3><a href="p/${encodeURIComponent(post.slug)}.html">${post.title}</a></h3>
    <p>${post.excerpt}</p>
    <div class="meta">${post.date} · ${post.tags.join(', ')}</div>
  `;
  return card;
}

function getQueryParameter(name) {
  return new URLSearchParams(window.location.search).get(name);
}

async function renderIndex() {
  const posts = await loadJson('/posts.json');
  const list = document.getElementById('postList');
  posts.sort((a, b) => (a.date < b.date ? 1 : -1));
  posts.forEach(post => list.appendChild(createPostCard(post)));
}

function parseFrontmatter(text) {
  const fmMatch = text.match(/^---\r?\n([\s\S]+?)\r?\n---\r?\n/);
  if (!fmMatch) return { metadata: {}, content: text };
  
  const yaml = fmMatch[1];
  const content = text.slice(fmMatch[0].length);
  const metadata = {};
  
  yaml.split('\n').forEach(line => {
    const [key, ...val] = line.split(':');
    if (key && val.length) {
      let value = val.join(':').trim();
      // Remove surrounding quotes if they exist
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      metadata[key.trim()] = value;
    }
  });
  
  return { metadata, content };
}

function renderPostMeta(post, metadata) {
  const meta = document.getElementById('postMeta');
  const hero = document.getElementById('heroContainer');
  const subtitle = metadata.subtitle || post.excerpt || '';
  
  meta.innerHTML = `
    <p class="eyebrow">${post.tags.join(' · ')}</p>
    <h1>${post.title}</h1>
    ${subtitle ? `<p class="post-subtitle">${subtitle}</p>` : ''}
    <p class="meta">Published ${post.date}</p>
  `;

  if (metadata.hero_image && hero) {
    hero.innerHTML = `<img src="${metadata.hero_image}" class="hero-image" alt="">`;
  }

  const adSlot = document.getElementById('jokeAdSlot');
  if (adSlot && metadata.joke_ad_image) {
    const link = metadata.joke_ad_link || 'https://www.youtube.com/watch?v=Aq5WXmQQooo';
    adSlot.innerHTML = `
      <a href="${link}" class="ad-card ad-card-image" target="_blank" rel="noopener">
        <p class="ad-label">Sponsored</p>
        <img src="${metadata.joke_ad_image}" alt="Sponsored advert" />
      </a>`;
  }
}

async function renderPost() {
  const slug = window.__SLUG__ || getQueryParameter('slug');
  if (!slug) {
    document.getElementById('postContent').innerText = 'No post selected.';
    return;
  }
  const posts = await loadJson('/posts.json');
  const post = posts.find(item => item.slug === slug);
  if (!post) {
    document.getElementById('postContent').innerText = 'Post not found.';
    return;
  }

  const rawText = await fetch(`/posts/${post.date}-${post.slug}.md`, { cache: 'no-store' }).then(res => res.text());
  const { metadata, content } = parseFrontmatter(rawText);

  renderPostMeta(post, metadata);
  document.getElementById('postContent').innerHTML = marked.parse(content);
  renderShareRow(post);
}

window.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('postList')) {
    renderIndex().catch(error => console.error(error));
    renderHomeShareRow();
  }
  if (document.getElementById('postContent')) {
    renderPost().catch(error => {
      console.error(error);
      document.getElementById('postContent').innerText = 'Failed to load the post.';
    });
  }
});
