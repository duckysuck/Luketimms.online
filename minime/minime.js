/* Mini Luke: walks down the right-hand margin as you scroll, points at each section,
   and answers common questions about the CV (answers live in answers.js). */
(() => {
  const BASE = "/minime/";
  const FRAMES = ["idle", "walk1", "walk2", "point", "point-up", "happy", "confused", "hint", "thumbs", "sleep", "coffee"];

  // What he does when a section is the one you're reading (keyed by section id). Bubbles show the first time only.
  const SECTIONS = {
    currently:  { pose: "point",    say: "Here's what I'm up to now." },
    about:      { pose: "point",    say: "That's me!" },
    experience: { pose: "point-up", say: "The good stuff." },
    services:   { pose: "point",    say: "How I can help." },
    reel:       { pose: "happy",    say: "Ooh, the fun bit." },
    softography: { pose: "point-up", say: "Every game I've shipped!" },
    contact:    { pose: "thumbs",   say: "Click me to say hello!" },
  };


  const MIN_WIDTH = 1200;      // needs room on the right to walk in; narrower screens get a launcher button
  const SLEEP_AFTER = 25000;   // ms without scrolling
  const STORE_KEY = "minime-hidden";

  // Sprite geometry: frames are 560x400, drawn at 45%, feet at (190, 388) in the frame
  const W = 252, H = 180, FEET_X = 85.5;
  const PANEL_W = 330;

  // "Let's talk": messages go to Luke's inbox through formsubmit.co (same service the old contact chat used)
  const CONTACT_ENDPOINT = "https://formsubmit.co/ajax/" + encodeURIComponent("lukedtimms@gmail.com");
  const CONTACT_STEPS = [
    { key: "need", say: "Let's talk! What brings you here?",
      chips: ["Shipping a new title", "Scaling production / process", "Production support", "Just exploring"] },
    { key: "team", say: "Cool. Who are you with? Studio, team or company is fine.",
      text: "Studio or company name", optional: true },
    { key: "email", say: "Last thing: where should I reply? Pop your email in, plus a quick note if you like.",
      email: "you@studio.com", note: "Optional: anything I should know up front…" },
  ];

  let hiddenByVisitor = false;
  try { hiddenByVisitor = localStorage.getItem(STORE_KEY) === "1"; } catch (e) { /* storage blocked: show him */ }

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Answers live in their own file so they can be edited without touching this one
  const answersReady = new Promise((resolve) => {
    if (window.MINIME_ANSWERS) return resolve();
    const s = document.createElement("script");
    s.src = `${BASE}answers.js`;
    s.onload = resolve;
    s.onerror = resolve;
    document.head.appendChild(s);
  });

  const css = `
    .minime { position: fixed; top: 0; left: 0; z-index: 40; width: ${W}px; height: ${H}px;
      pointer-events: none; will-change: transform; display: none; }
    .minime.on { display: block; }
    .minime-sprite, .minime-shadow { transition: opacity 0.3s; }
    .minime.faded .minime-sprite, .minime.faded .minime-shadow { opacity: 0.28; }
    .minime:hover .minime-sprite, .minime:hover .minime-shadow, .minime.chatting .minime-sprite { opacity: 1; }
    .minime-sprite { position: absolute; inset: 0; background: center / contain no-repeat;
      transform-origin: ${FEET_X}px 100%;
      filter: drop-shadow(0 0 1px rgba(240, 236, 226, 0.35)) drop-shadow(0 6px 6px rgba(0, 0, 0, 0.25)); }
    [data-theme="light"] .minime-sprite { filter: drop-shadow(0 6px 6px rgba(20, 19, 15, 0.15)); }
    .minime-hit { position: absolute; left: 38px; top: 36px; width: 96px; height: 140px; padding: 0;
      border: 0; background: transparent; pointer-events: auto; cursor: pointer; border-radius: 12px; }
    .minime-hit:focus-visible { outline: 2px solid var(--accent, #ff5b14); outline-offset: 2px; }
    .minime-shadow { position: absolute; left: ${FEET_X - 28}px; bottom: 2px; width: 56px; height: 8px;
      border-radius: 50%; background: rgba(0, 0, 0, 0.35); filter: blur(2px); }
    [data-theme="light"] .minime-shadow { background: rgba(20, 19, 15, 0.15); }
    .minime-bubble { position: absolute; right: ${W - 140}px; bottom: ${H - 30}px; max-width: 220px; width: max-content;
      padding: 0.5rem 0.7rem; border-radius: 12px 12px 3px 12px;
      font: 500 0.72rem/1.35 'JetBrains Mono', ui-monospace, monospace; letter-spacing: 0.02em;
      color: var(--text, #f0ece2); background: var(--bg-soft, #14130f); border: 1px solid var(--accent, #ff5b14);
      opacity: 0; transform: translateY(4px); transition: opacity 0.25s, transform 0.25s; }
    .minime-bubble.show { opacity: 1; transform: none; }
    .minime-close { position: absolute; left: 128px; top: 34px; width: 20px; height: 20px; border-radius: 50%;
      border: 1px solid var(--line, #1f1d17); background: var(--bg-soft, #14130f); color: var(--text-dim, #b3ad9f);
      font: 600 12px/18px system-ui, sans-serif; text-align: center; padding: 0; cursor: pointer;
      opacity: 0; transition: opacity 0.2s; pointer-events: auto; }
    .minime:hover .minime-close, .minime-close:focus-visible { opacity: 1; }
    .minime.chatting .minime-close { display: none; }

    .minime-chat { position: fixed; z-index: 1000; width: ${PANEL_W}px; max-height: min(460px, calc(100vh - 100px));
      display: none; flex-direction: column; overflow: hidden;
      background: var(--bg-soft, #14130f); color: var(--text, #f0ece2);
      border: 1px solid var(--accent, #ff5b14); border-radius: 16px;
      box-shadow: 0 18px 50px rgba(0, 0, 0, 0.45); font-family: 'Inter Tight', system-ui, sans-serif; }
    [data-theme="light"] .minime-chat { box-shadow: 0 18px 50px rgba(20, 19, 15, 0.18); }
    .minime-chat.open { display: flex; }
    .minime-chat-head { display: flex; align-items: center; gap: 0.6rem; padding: 0.7rem 0.8rem;
      border-bottom: 1px solid var(--line, #1f1d17); }
    .minime-chat-head img { width: 34px; height: 34px; border-radius: 50%; object-fit: cover;
      background: var(--bg, #0d0c0a); }
    .minime-chat-head strong { display: block; font-size: 0.92rem; }
    .minime-chat-head small { display: block; color: var(--text-dim, #b3ad9f);
      font: 400 0.68rem/1.3 'JetBrains Mono', ui-monospace, monospace; letter-spacing: 0.02em; }
    .minime-chat-head button { margin-left: auto; width: 28px; height: 28px; border-radius: 50%; cursor: pointer;
      border: 1px solid var(--line, #1f1d17); background: transparent; color: var(--text-dim, #b3ad9f); font-size: 15px; }
    .minime-log { flex: 1; overflow-y: auto; padding: 0.8rem; display: flex; flex-direction: column; gap: 0.55rem; }
    .minime-msg { white-space: pre-line; max-width: 88%; padding: 0.55rem 0.75rem; border-radius: 14px; font-size: 0.86rem; line-height: 1.45; }
    .minime-msg.him { align-self: flex-start; background: var(--bg, #0d0c0a); border: 1px solid var(--line, #1f1d17);
      border-bottom-left-radius: 4px; }
    .minime-msg.you { align-self: flex-end; background: var(--accent, #ff5b14); color: #fff; border-bottom-right-radius: 4px; }
    .minime-msg .minime-act { display: inline-block; margin-top: 0.45rem; padding: 0.3rem 0.65rem; border-radius: 999px;
      border: 1px solid var(--accent, #ff5b14); color: var(--accent, #ff5b14); background: transparent; cursor: pointer;
      font: 600 0.72rem/1.2 'JetBrains Mono', ui-monospace, monospace; text-decoration: none; letter-spacing: 0.03em; }
    .minime-msg .minime-act:hover { background: var(--accent, #ff5b14); color: #fff; }
    .minime-typing { align-self: flex-start; color: var(--text-dim, #b3ad9f); font-size: 0.8rem; padding: 0 0.3rem; }
    .minime-chips { display: flex; flex-wrap: wrap; gap: 0.35rem; padding: 0 0.8rem 0.6rem; }
    .minime-chips button { padding: 0.32rem 0.6rem; border-radius: 999px; cursor: pointer;
      border: 1px solid var(--line, #1f1d17); background: transparent; color: var(--text, #f0ece2);
      font: 500 0.74rem/1.2 'Inter Tight', system-ui, sans-serif; }
    .minime-chips button:hover { border-color: var(--accent, #ff5b14); color: var(--accent, #ff5b14); }
    .minime-form { display: flex; gap: 0.4rem; padding: 0.6rem; border-top: 1px solid var(--line, #1f1d17); }
    .minime-form input { flex: 1; min-width: 0; padding: 0.55rem 0.7rem; border-radius: 10px;
      border: 1px solid var(--line, #1f1d17); background: var(--bg, #0d0c0a); color: var(--text, #f0ece2);
      font: 400 0.86rem 'Inter Tight', system-ui, sans-serif; }
    .minime-form input:focus { outline: none; border-color: var(--accent, #ff5b14); }
    .minime-form button { padding: 0 0.85rem; border-radius: 10px; border: 0; cursor: pointer;
      background: var(--accent, #ff5b14); color: #fff; font: 600 0.8rem 'Inter Tight', system-ui, sans-serif; }

    .minime-flow { display: none; flex-direction: column; gap: 0.45rem; padding: 0.6rem;
      border-top: 1px solid var(--line, #1f1d17); }
    .minime-chat.talking .minime-flow { display: flex; }
    .minime-chat.talking .minime-chips, .minime-chat.talking .minime-form { display: none; }
    .minime-flow .row { display: flex; gap: 0.4rem; }
    .minime-flow .opts { display: flex; flex-wrap: wrap; gap: 0.35rem; }
    .minime-flow .opts button { padding: 0.4rem 0.7rem; border-radius: 999px; cursor: pointer;
      border: 1px solid var(--accent, #ff5b14); background: transparent; color: var(--text, #f0ece2);
      font: 500 0.78rem/1.2 'Inter Tight', system-ui, sans-serif; }
    .minime-flow .opts button:hover { background: var(--accent, #ff5b14); color: #fff; }
    .minime-flow input, .minime-flow textarea { flex: 1; min-width: 0; padding: 0.55rem 0.7rem; border-radius: 10px;
      border: 1px solid var(--line, #1f1d17); background: var(--bg, #0d0c0a); color: var(--text, #f0ece2);
      font: 400 0.86rem 'Inter Tight', system-ui, sans-serif; resize: vertical; }
    .minime-flow input:focus, .minime-flow textarea:focus { outline: none; border-color: var(--accent, #ff5b14); }
    .minime-flow .send { padding: 0.5rem 0.9rem; border-radius: 10px; border: 0; cursor: pointer;
      background: var(--accent, #ff5b14); color: #fff; font: 600 0.8rem 'Inter Tight', system-ui, sans-serif; }
    .minime-flow .ghost { padding: 0.5rem 0.75rem; border-radius: 10px; cursor: pointer;
      border: 1px solid var(--line, #1f1d17); background: transparent; color: var(--text-dim, #b3ad9f);
      font: 500 0.78rem 'Inter Tight', system-ui, sans-serif; }
    .minime-flow .foot { display: flex; justify-content: space-between; align-items: center; }
    .minime-flow .bad { color: var(--accent, #ff5b14); font-size: 0.75rem; }

    .minime-cta { display: inline-flex; align-items: center; gap: 0.6rem; margin: 0.4rem 0 1.2rem;
      padding: 0.45rem 1.2rem 0.45rem 0.45rem; border-radius: 999px; cursor: pointer;
      border: 1px solid var(--accent, #ff5b14); background: var(--accent, #ff5b14); color: #fff;
      font: 600 1rem 'Inter Tight', system-ui, sans-serif; }
    .minime-cta img { width: 42px; height: 42px; border-radius: 50%; background: var(--bg, #0d0c0a); }
    .minime-cta:hover { filter: brightness(1.08); }

    .minime-launch { position: fixed; left: 14px; bottom: 14px; z-index: 44; display: none; align-items: center; gap: 0.45rem;
      padding: 0.3rem 0.85rem 0.3rem 0.3rem; border-radius: 999px; cursor: pointer;
      border: 1px solid var(--accent, #ff5b14); background: var(--bg-soft, #14130f); color: var(--text, #f0ece2);
      font: 600 0.8rem 'Inter Tight', system-ui, sans-serif; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35); }
    .minime-launch img { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; }
    .minime-launch.on { display: inline-flex; }
    .minime-chat.sheet { left: 10px !important; right: 10px; bottom: 10px; top: auto !important;
      width: auto; max-height: 72vh; }

    @media print { .minime, .minime-chat, .minime-launch { display: none !important; } }
  `;

  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  // ---------- elements ----------

  const el = document.createElement("div");
  el.className = "minime";
  el.innerHTML = `<div class="minime-shadow" aria-hidden="true"></div><div class="minime-sprite" aria-hidden="true"></div>
    <button class="minime-hit" type="button" aria-label="Ask mini Luke about Luke's CV" title="Ask me about my CV"></button>
    <div class="minime-bubble" aria-hidden="true"></div>
    <button class="minime-close" type="button" title="Hide mini Luke" aria-label="Hide mini Luke">×</button>`;
  document.body.appendChild(el);

  const avatar = `${BASE}avatar.webp`;
  const chat = document.createElement("div");
  chat.className = "minime-chat";
  chat.setAttribute("role", "dialog");
  chat.setAttribute("aria-label", "Ask mini Luke");
  chat.innerHTML = `
    <div class="minime-chat-head">
      <img src="${avatar}" alt="">
      <div><strong>Ask mini Luke</strong><small class="minime-sub">Quick answers from my CV</small></div>
      <button type="button" class="minime-chat-close" aria-label="Close">×</button>
    </div>
    <div class="minime-log" role="log" aria-live="polite"></div>
    <div class="minime-chips"></div>
    <div class="minime-flow"></div>
    <form class="minime-form" autocomplete="off">
      <input type="text" maxlength="200" placeholder="Ask about my games, roles, skills…" aria-label="Your question">
      <button type="submit">Ask</button>
    </form>`;
  document.body.appendChild(chat);

  const launch = document.createElement("button");
  launch.type = "button";
  launch.className = "minime-launch";
  launch.innerHTML = `<img src="${avatar}" alt="">Ask mini Luke`;
  document.body.appendChild(launch);

  const sprite = el.querySelector(".minime-sprite");
  const bubble = el.querySelector(".minime-bubble");
  const log = chat.querySelector(".minime-log");
  const chips = chat.querySelector(".minime-chips");
  const input = chat.querySelector(".minime-form input");
  const flow = chat.querySelector(".minime-flow");
  const sub = chat.querySelector(".minime-sub");

  for (const f of FRAMES) new Image().src = `${BASE}${f}.webp`;

  // The drawings face right; on the right-hand side he faces left (towards the content)
  let pose = "";
  function setPose(name, faceRight = false) {
    if (name !== pose) {
      sprite.style.backgroundImage = `url(${BASE}${name}.webp)`;
      pose = name;
    }
    sprite.style.transform = faceRight ? "" : "scaleX(-1)";
  }

  let chatOpen = false;
  let bubbleTimer = 0;
  function say(text, ms = 3200) {
    if (chatOpen) return;
    clearTimeout(bubbleTimer);
    bubble.textContent = text;
    bubble.classList.add("show");
    bubbleTimer = setTimeout(() => bubble.classList.remove("show"), ms);
  }

  // ---------- layout ----------

  const sections = Object.entries(SECTIONS)
    .map(([id, s]) => ({ id, el: document.getElementById(id), ...s }))
    .filter((s) => s.el);
  const TOP = 92, BOTTOM = 112; // clear of the top bar and the theme button

  let x = 0, y = TOP;
  let wide = false;

  function measure() {
    wide = innerWidth >= MIN_WIDTH;
    el.classList.toggle("on", wide && !hiddenByVisitor);
    launch.classList.toggle("on", !wide || hiddenByVisitor);
    chat.classList.toggle("sheet", !wide || hiddenByVisitor);
    x = innerWidth - 120 - FEET_X; // feet ~120px in from the right edge
  }

  function progress() {
    const max = document.documentElement.scrollHeight - innerHeight;
    return max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
  }

  const targetFor = () => TOP + progress() * (innerHeight - TOP - BOTTOM - H);

  function activeSection() {
    let current = null;
    for (const s of sections) {
      if (s.el.getBoundingClientRect().top < innerHeight * 0.55) current = s;
    }
    return current;
  }

  // Fade him back when he's standing over text, cards or video, so the page stays readable
  const MEDIA_TAGS = new Set(["IMG", "IFRAME", "VIDEO", "CANVAS", "SVG", "BUTTON", "INPUT", "TEXTAREA"]);
  const visible = (c) => c && c !== "transparent" && !/rgba\([^)]*,\s*0\)$/.test(c);

  // Text blocks are often far wider than their words, so test against the rendered lines themselves
  function textUnder(node, px, py) {
    const range = document.createRange();
    range.selectNodeContents(node);
    for (const r of range.getClientRects()) {
      if (px >= r.left - 12 && px <= r.right + 12 && py >= r.top && py <= r.bottom) return true;
    }
    return false;
  }

  function isContent(node, px, py) {
    if (MEDIA_TAGS.has(node.tagName.toUpperCase())) return true;
    const cs = getComputedStyle(node);
    const narrow = node.getBoundingClientRect().width < innerWidth * 0.85;
    if (narrow && (visible(cs.backgroundColor) || parseFloat(cs.borderLeftWidth) > 0)) return true; // cards
    const hasText = [...node.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    return hasText && textUnder(node, px, py);
  }

  function overContent() {
    const cx = x + FEET_X;
    for (const py of [y + 60, y + 110, y + 160]) {
      for (const hit of document.elementsFromPoint(cx, py)) {
        if (el.contains(hit) || chat.contains(hit)) continue;
        if (isContent(hit, cx, py)) return true;
      }
    }
    return false;
  }

  function placeChat() {
    if (!chatOpen || chat.classList.contains("sheet")) return;
    const h = chat.offsetHeight;
    chat.style.left = `${Math.max(12, x + 30 - PANEL_W)}px`;
    chat.style.top = `${Math.min(Math.max(72, y - 30), innerHeight - h - 16)}px`;
  }

  // ---------- behaviour ----------

  const greeted = new Set();
  let lastScroll = performance.now();
  let scrollingUp = false;
  let asleep = false;
  let override = null;       // { pose, until } for answers / waking up
  let walkPhase = 0;
  let tick = 0;
  let lastSection;
  let lastScrollY = scrollY;

  function restingPose() {
    const atBottom = innerHeight + scrollY >= document.documentElement.scrollHeight - 4;
    if (atBottom) return "thumbs";
    const section = activeSection();
    if (section !== lastSection) {
      lastSection = section;
      if (section && !greeted.has(section.id)) {
        greeted.add(section.id);
        say(section.say);
      }
    }
    return section ? section.pose : "idle";
  }

  function frame(now) {
    requestAnimationFrame(frame);
    if (!el.classList.contains("on")) return;

    const targetY = targetFor();
    const dy = targetY - y;
    y = reduceMotion ? targetY : y + dy * 0.12;
    const moving = !reduceMotion && Math.abs(dy) > 1.5;

    let bob = 0;
    if (override && now < override.until) {
      setPose(override.pose);
    } else if (asleep) {
      setPose("sleep");
    } else if (moving) {
      walkPhase += 1;
      const step = Math.floor(walkPhase / 9) % 2;
      setPose(step ? "walk2" : "walk1", scrollingUp);
      bob = step ? -2 : 0;
    } else {
      override = null;
      setPose(restingPose());
    }

    if (!asleep && !chatOpen && now - lastScroll > SLEEP_AFTER) {
      asleep = true;
      bubble.classList.remove("show");
    }

    el.style.transform = `translate3d(${x}px, ${y + bob}px, 0)`;
    placeChat();
    if (++tick % 8 === 0) el.classList.toggle("faded", !chatOpen && overContent());
  }

  function react(name, ms = 3500) {
    lastScroll = performance.now();
    asleep = false;
    override = { pose: name, until: performance.now() + ms };
  }

  // ---------- question matching ----------

  const normalise = (s) => ` ${s.toLowerCase().replace(/[^a-z0-9é+\s-]/g, " ").replace(/\s+/g, " ").trim()} `;

  function findAnswer(question) {
    const q = normalise(question);
    let best = null, bestScore = 0;
    for (const entry of window.MINIME_ANSWERS || []) {
      let score = 0;
      for (const key of entry.keys) {
        const k = key.trim().toLowerCase();
        if (q.includes(` ${k} `)) score += k.includes(" ") ? 3 : 1;
      }
      if (score > bestScore) { best = entry; bestScore = score; }
    }
    return best || window.MINIME_FALLBACK || { answer: "Ask me about my CV!", pose: "confused" };
  }

  // ---------- chat ----------

  const asked = new Set();
  let opener = null;

  function addMessage(who, text, action) {
    const m = document.createElement("div");
    m.className = `minime-msg ${who}`;
    m.textContent = text;
    if (action) {
      if (action.contact) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "minime-act";
        b.textContent = `${action.label} →`;
        b.addEventListener("click", () => startContact());
        m.appendChild(document.createElement("br"));
        m.appendChild(b);
        log.appendChild(m);
        log.scrollTop = log.scrollHeight;
        return;
      }
      const a = document.createElement(action.href ? "a" : "button");
      a.className = "minime-act";
      a.textContent = `${action.label} →`;
      if (action.href) {
        a.href = action.href;
        if (/\.pdf$/i.test(action.href) || /^https?:/.test(action.href)) { a.target = "_blank"; a.rel = "noopener"; }
      } else {
        a.type = "button";
        a.addEventListener("click", () => {
          const target = document.getElementById(action.scroll);
          if (!target) return (location.href = `/#${action.scroll}`); // e.g. a page without that section
          target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
          if (!wide || hiddenByVisitor) closeChat();
        });
      }
      m.appendChild(document.createElement("br"));
      m.appendChild(a);
    }
    log.appendChild(m);
    log.scrollTop = log.scrollHeight;
  }

  function renderChips() {
    const entries = (window.MINIME_ANSWERS || []).filter((e) => e.q && !asked.has(e.q));
    chips.innerHTML = "";
    for (const e of entries.slice(0, log.children.length > 1 ? 3 : 5)) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = e.q;
      b.addEventListener("click", () => ask(e.q));
      chips.appendChild(b);
    }
    log.scrollTop = log.scrollHeight; // chips change the log's height; keep the latest message in view
  }

  let answering = false;
  function ask(question) {
    question = question.trim();
    if (!question || answering) return;
    answering = true;
    asked.add(question);
    addMessage("you", question);
    const entry = findAnswer(question);
    if (entry.q) asked.add(entry.q);

    const typing = document.createElement("div");
    typing.className = "minime-typing";
    typing.textContent = "mini Luke is thinking…";
    log.appendChild(typing);
    log.scrollTop = log.scrollHeight;
    react("hint", 900);

    setTimeout(() => {
      typing.remove();
      addMessage("him", entry.answer, entry.action);
      react(entry.pose || "happy");
      renderChips();
      answering = false;
    }, reduceMotion ? 150 : 650);
  }

  async function openChat(from, contact = false) {
    await answersReady;
    opener = from || null;
    chatOpen = true;
    el.classList.add("chatting");
    bubble.classList.remove("show");
    chat.classList.add("open");
    if (contact) {
      startContact();
    } else if (!log.children.length) {
      addMessage("him", "Hi! I'm mini Luke. Ask me anything about my CV, or tap a question below.");
      renderChips();
    }
    react("happy", 1500);
    placeChat();
    if (!contact) setTimeout(() => input.focus({ preventScroll: true }), 30);
  }

  // ---------- let's talk ----------

  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  let talk = null; // { step, answers }

  function startContact() {
    if (!chatOpen) return openChat(null, true);
    if (talk) return; // already mid-conversation (e.g. closed and reopened): carry on where they left off
    talk = { step: 0, answers: {} };
    chat.classList.add("talking");
    sub.textContent = "Let's talk";
    react("thumbs", 2000);
    nextStep();
  }

  function endContact(message) {
    talk = null;
    chat.classList.remove("talking");
    sub.textContent = "Quick answers from my CV";
    flow.innerHTML = "";
    if (message) addMessage("him", message);
    renderChips();
  }

  function nextStep() {
    const step = CONTACT_STEPS[talk.step];
    if (!step) return sendContact();
    addMessage("him", step.say);
    flow.innerHTML = "";

    if (step.chips) {
      flow.innerHTML = `<div class="opts">${step.chips.map((c) => `<button type="button">${esc(c)}</button>`).join("")}</div>`;
      flow.querySelectorAll(".opts button").forEach((b) => b.addEventListener("click", () => reply(step, b.textContent)));
    } else if (step.text) {
      flow.innerHTML = `<form class="row" novalidate>
        <input type="text" maxlength="120" placeholder="${esc(step.text)}" aria-label="${esc(step.text)}" autocomplete="organization">
        ${step.optional ? '<button type="button" class="ghost">Skip</button>' : ""}
        <button type="submit" class="send">Send</button></form>`;
      const f = flow.querySelector("form");
      const i = f.querySelector("input");
      f.addEventListener("submit", (e) => { e.preventDefault(); if (i.value.trim() || step.optional) reply(step, i.value.trim() || "(skipped)"); });
      const skip = f.querySelector(".ghost");
      if (skip) skip.addEventListener("click", () => reply(step, "(skipped)"));
      setTimeout(() => i.focus({ preventScroll: true }), 30);
    } else if (step.email) {
      flow.innerHTML = `<form novalidate style="display:flex;flex-direction:column;gap:0.45rem">
        <input type="email" maxlength="160" placeholder="${esc(step.email)}" aria-label="Your email" autocomplete="email" required>
        <textarea rows="3" maxlength="1500" placeholder="${esc(step.note)}" aria-label="Note for Luke"></textarea>
        <div class="foot"><span class="bad" aria-live="polite"></span><button type="submit" class="send">Send to Luke</button></div></form>`;
      const f = flow.querySelector("form");
      const em = f.querySelector("input");
      const note = f.querySelector("textarea");
      f.addEventListener("submit", (e) => {
        e.preventDefault();
        const v = em.value.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
          f.querySelector(".bad").textContent = "That email doesn't look quite right.";
          return em.focus();
        }
        talk.answers.note = note.value.trim();
        reply(step, v + (talk.answers.note ? `\n${talk.answers.note}` : ""), v);
      });
      setTimeout(() => em.focus({ preventScroll: true }), 30);
    }

    // a quiet way out of the flow at every step
    const out = document.createElement("button");
    out.type = "button";
    out.className = "ghost";
    out.textContent = "← Back to questions";
    out.style.alignSelf = "flex-start";
    out.addEventListener("click", () => endContact("No problem. Ask me anything else!"));
    flow.appendChild(out);
  }

  function reply(step, shown, value = shown) {
    addMessage("you", shown);
    talk.answers[step.key] = value;
    talk.step += 1;
    flow.innerHTML = "";
    react("hint", 700);
    setTimeout(nextStep, reduceMotion ? 100 : 500);
  }

  async function sendContact() {
    const a = talk.answers;
    flow.innerHTML = "";
    const typing = document.createElement("div");
    typing.className = "minime-typing";
    typing.textContent = "Sending to Luke…";
    log.appendChild(typing);
    let ok = false;
    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: "New chat from luketimms.online",
          _captcha: "false",
          _template: "table",
          _replyto: a.email || "",
          need: a.need || "",
          team: a.team || "",
          email: a.email || "",
          note: a.note || "",
        }),
      });
      const data = await res.json();
      ok = data && (data.success === "true" || data.success === true);
    } catch (e) {
      ok = false;
    }
    typing.remove();
    if (ok) {
      react("happy", 4000);
      endContact("Done! Your message is with me now. I'll be in touch very soon.");
    } else {
      react("confused", 3000);
      addMessage("him", "Hmm, that didn't go through. Could you reach me on LinkedIn instead?",
        { label: "LinkedIn", href: "https://www.linkedin.com/in/luketimms" });
      endContact();
    }
  }

  function closeChat() {
    chatOpen = false;
    el.classList.remove("chatting");
    chat.classList.remove("open");
    if (opener) opener.focus({ preventScroll: true });
  }

  chat.querySelector(".minime-form").addEventListener("submit", (e) => {
    e.preventDefault();
    ask(input.value);
    input.value = "";
  });
  chat.querySelector(".minime-chat-close").addEventListener("click", closeChat);
  chat.addEventListener("keydown", (e) => { if (e.key === "Escape") closeChat(); });

  el.querySelector(".minime-hit").addEventListener("click", (e) => (chatOpen ? closeChat() : openChat(e.currentTarget)));
  launch.addEventListener("click", (e) => (chatOpen ? closeChat() : openChat(e.currentTarget)));

  // Anyone heading off to buy Luke a coffee gets a cheers
  document.addEventListener("click", (e) => {
    if (!e.target.closest('a[href*="buymeacoffee.com"]')) return;
    react("coffee", 3500);
    say("Cheers! ☕", 3000);
  });

  // The top bar's "Let's talk" pill and any [data-minime-contact] button open the chat straight into the contact flow
  document.addEventListener("click", (e) => {
    const t = e.target.closest('a.cta[href="#contact"], [data-minime-contact]');
    if (!t) return;
    e.preventDefault();
    if (chatOpen && talk) return;
    if (chatOpen) startContact(); else openChat(t, true);
  });

  // Replace the old contact chat with a single button that opens mini Luke
  const slot = document.querySelector("#contact [data-minime-slot]");
  if (slot) {
    slot.innerHTML = `<button type="button" class="minime-cta" data-minime-contact><img src="${avatar}" alt="">Say hello to mini me</button>`;
  }

  el.querySelector(".minime-close").addEventListener("click", () => {
    hiddenByVisitor = true;
    try { localStorage.setItem(STORE_KEY, "1"); } catch (e) { /* fine: hidden for this visit */ }
    measure(); // the small launcher button takes his place, so the chat is still reachable
  });

  // ---------- events ----------

  addEventListener("scroll", () => {
    const now = performance.now();
    scrollingUp = scrollY < lastScrollY;
    lastScrollY = scrollY;
    lastScroll = now;
    if (asleep) {
      asleep = false;
      override = { pose: "confused", until: now + 900 };
    }
  }, { passive: true });

  addEventListener("resize", measure);

  // ---------- start ----------

  measure();
  y = targetFor();
  setPose("idle");
  if (wide && !hiddenByVisitor) {
    setTimeout(() => { if (!greeted.size && scrollY < 50) say("Hi! Click me to ask about my CV.", 4500); }, 1200);
  }
  requestAnimationFrame(frame);
})();
