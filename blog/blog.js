async function loadJson(url) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Failed to load ${url}: ${response.status}`);
  return response.json();
}

function createPostCard(post) {
  const card = document.createElement('div');
  card.className = 'post-card';
  card.innerHTML = `
    <h3><a href="post.html?slug=${encodeURIComponent(post.slug)}">${post.title}</a></h3>
    <p>${post.excerpt}</p>
    <div class="meta">${post.date} · ${post.tags.join(', ')}</div>
  `;
  return card;
}

function getQueryParameter(name) {
  return new URLSearchParams(window.location.search).get(name);
}

async function renderIndex() {
  const posts = await loadJson('posts.json');
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
  const slug = getQueryParameter('slug');
  if (!slug) {
    document.getElementById('postContent').innerText = 'No post selected.';
    return;
  }
  const posts = await loadJson('posts.json');
  const post = posts.find(item => item.slug === slug);
  if (!post) {
    document.getElementById('postContent').innerText = 'Post not found.';
    return;
  }
  
  const rawText = await fetch(`posts/${post.date}-${post.slug}.md`, { cache: 'no-store' }).then(res => res.text());
  const { metadata, content } = parseFrontmatter(rawText);
  
  renderPostMeta(post, metadata);
  document.getElementById('postContent').innerHTML = marked.parse(content);
}

window.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('postList')) {
    renderIndex().catch(error => console.error(error));
  }
  if (document.getElementById('postContent')) {
    renderPost().catch(error => {
      console.error(error);
      document.getElementById('postContent').innerText = 'Failed to load the post.';
    });
  }
});
