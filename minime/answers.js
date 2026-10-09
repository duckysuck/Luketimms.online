/*
  Mini Luke's answers. Edit freely: everything he says lives here.

  Each entry:
    q        the suggestion chip shown to visitors (leave "" to never show it as a chip)
    keys     words or phrases that trigger it (lower case; phrases score higher than single words)
    answer   what he says (first person, from the CV)
    pose     point | point-up | happy | confused | thumbs | hint | coffee
    action   optional button: { label, scroll: "<section id>" } or { label, href: "<url>" }
*/
window.MINIME_ANSWERS = [
  {
    q: "Who are you?",
    keys: ["who are you", "about you", "yourself", "introduce", "summary", "background", "who is luke", "about luke"],
    answer: "I'm Luke: a delivery leader with 25 years across gaming, tech and enterprise consulting. I lead complex, cross-functional delivery from a people-first perspective. In short, I turn chaos into structure.",
    pose: "happy",
    action: { label: "Read more", scroll: "about" },
  },
  {
    q: "What do you do now?",
    keys: ["current", "currently", "now", "present", "today", "jean edwards", "latest role", "current job", "current role"],
    answer: "Right now I'm a Senior Project Manager at Jean Edwards Consulting (since March 2026), leading client delivery projects end to end: owning scope, milestones and delivery rhythm.",
    pose: "point",
    action: { label: "See my experience", scroll: "experience" },
  },
  {
    q: "What games have you shipped?",
    keys: ["games", "game", "shipped", "titles", "credits", "softography", "mobygames", "portfolio", "worked on"],
    answer: "28 shipped titles, 11+ live events and 10+ platforms. Highlights include Harry Potter and the Deathly Hallows Parts 1 & 2, Reservoir Dogs, Constantine, Richard Burns Rally and the Conflict series.",
    pose: "point-up",
    action: { label: "See them all", scroll: "softography" },
  },
  {
    q: "",
    keys: ["harry potter", "potter", "deathly hallows", "electronic arts", "ea"],
    answer: "From 2010 to 2011 I was a contracting producer at Electronic Arts, owning the production pipeline and milestone delivery on Harry Potter and the Deathly Hallows Parts 1 & 2.",
    pose: "point-up",
  },
  {
    q: "",
    keys: ["eidos", "reservoir dogs", "constantine", "conflict", "richard burns", "prism", "sci games", "sci"],
    answer: "I spent 2000 to 2008 at SCi Games and Eidos, starting in QA and moving into production as Associate Producer on titles like Reservoir Dogs, Constantine, Conflict: Global Terror, Richard Burns Rally and Prism: Light the Way.",
    pose: "point-up",
    action: { label: "See them all", scroll: "softography" },
  },
  {
    q: "",
    keys: ["platform", "platforms", "console", "consoles", "playstation", "ps2", "ps3", "psp", "xbox", "nintendo", "wii", "gamecube", "dreamcast", "pc"],
    answer: "I've shipped on PlayStation 2, PlayStation 3, PSP, Xbox, Xbox 360, GameCube, Wii, Nintendo DS, Windows and Dreamcast, plus Unreal Engine live events.",
    pose: "point",
  },
  {
    q: "Tell me about the live events",
    keys: ["live event", "live events", "improbable", "imporium", "unreal", "multiplayer", "virtual world", "metaverse", "concurrent", "events"],
    answer: "From 2023 to 2025 I was Senior Producer and Head of QA at Improbable / Imporium, running Unreal Engine virtual-world live events with thousands of concurrent players. We shipped 11+ events, including NPC Snatchers, HotShots, Game4Ukraine and Clash of Fans.",
    pose: "happy",
    action: { label: "Watch the reel", scroll: "reel" },
  },
  {
    q: "How do you work? Agile?",
    keys: ["agile", "scrum", "kanban", "waterfall", "methodology", "methodologies", "process", "jira", "framework", "frameworks", "ways of working"],
    answer: "I'm an agile transformation leader, comfortable across Scrum, Kanban, Waterfall and hybrid models. I balance high-level governance with hands-on execution in Jira and modern workflows, so teams ship reliably.",
    pose: "point",
    action: { label: "What I bring", scroll: "services" },
  },
  {
    q: "",
    keys: ["leadership", "lead", "leader", "management style", "manage", "people first", "people-first", "team", "teams", "style", "approach"],
    answer: "People first. I build frameworks that enable great work rather than constrain it, and I adapt to the audience, protecting scope, giving partners clarity and driving quick decisions.",
    pose: "happy",
  },
  {
    q: "",
    keys: ["qa", "quality", "testing", "test", "tester", "head of qa"],
    answer: "QA is where I started, at SCi Games in 2000. Later, as Head of QA at Improbable, I introduced a QA operating model that improved release quality.",
    pose: "point-up",
  },
  {
    q: "",
    keys: ["ccp", "eve", "missions", "development manager"],
    answer: "At CCP Games (2021–2023) I was Senior Development Manager for the Missions Team. I redesigned the team's delivery systems and planning rhythms to make delivery more predictable across engineering and design.",
    pose: "point",
  },
  {
    q: "",
    keys: ["bank", "banking", "lloyds", "risk", "regulated", "finance", "financial"],
    answer: "From 2016 to 2021 I was a Senior Risk Manager and Product Owner at Lloyds Banking Group, embedding risk management into engineering and AI teams without slowing them down, and advising the CIO and CDO.",
    pose: "point",
  },
  {
    q: "",
    keys: ["accenture", "consulting", "consultant", "clients", "astrazeneca", "fca", "discovery"],
    answer: "I was at Accenture from 2013 to 2016, delivering digital projects for clients including the FCA, AstraZeneca and Discovery Channel. The delivery template I set up there became the standard for future client work.",
    pose: "point",
  },
  {
    q: "Do you use AI?",
    keys: ["ai", "artificial intelligence", "llm", "chatgpt", "claude", "machine learning", "automation"],
    answer: "Yes, I'm an active AI user. I help organisations scale delivery efficiency with it, knowing that what holds enterprise AI back is governance, funding and decision rights, not the tooling.",
    pose: "hint",
  },
  {
    q: "",
    keys: ["skills", "strengths", "competencies", "good at", "expertise", "bring", "offer", "services"],
    answer: "My core strengths: production pipeline ownership, end-to-end delivery leadership, cross-functional alignment, publisher and partner management, QA strategy, risk management, and milestone planning.",
    pose: "point",
    action: { label: "What I bring", scroll: "services" },
  },
  {
    q: "",
    keys: ["years", "how long", "experience", "career", "started", "start"],
    answer: "25 years across gaming, tech and enterprise consulting. I started in QA at SCi Games in 2000 and have been shipping things ever since.",
    pose: "point-up",
    action: { label: "See my experience", scroll: "experience" },
  },
  {
    q: "Are you open to new roles?",
    keys: ["open to", "available", "availability", "hire", "hiring", "looking for", "new role", "opportunity", "opportunities", "job", "recruit", "work with you", "work together"],
    answer: "Yes, I'm open to new exciting roles and challenges, and to the next studio to ship with! Tell me about yours, tap below and let's talk.",
    pose: "thumbs",
    action: { label: "Let's talk", contact: true },
  },
  {
    q: "Where are you based?",
    keys: ["where are you", "where do you live", "where based", "based", "location", "located", "uk", "uckfield", "london", "remote", "hybrid", "relocate", "office", "commute"],
    answer: "I'm based in Uckfield, in the UK. For questions about remote, hybrid or travel, it's best to ask the real me directly.",
    pose: "point",
    action: { label: "Let's talk", contact: true },
  },
  {
    q: "Can I get your CV?",
    keys: ["cv", "resume", "résumé", "pdf", "download"],
    answer: "Of course! Here's my CV as a PDF. There's also a CV button at the top of the page.",
    pose: "thumbs",
    action: { label: "Download CV", href: "/Luke-Timms-CV.pdf" },
  },
  {
    q: "",
    keys: ["contact", "email", "e-mail", "phone", "call", "talk", "reach", "message", "linkedin", "get in touch", "speak"],
    answer: "Easiest way is right here: tap below and I'll pass your message straight to me. You can also find me on LinkedIn.",
    pose: "thumbs",
    action: { label: "Let's talk", contact: true },
  },
  {
    q: "",
    keys: ["salary", "pay", "rate", "day rate", "money", "compensation", "notice", "notice period", "visa", "reference", "references", "package", "benefits"],
    answer: "That's one for the real me. Tap below to drop me a line and I'll get back to you!",
    pose: "thumbs",
    action: { label: "Let's talk", contact: true },
  },
  {
    q: "Can I buy you a coffee?",
    keys: ["coffee", "buy you a coffee", "buy me a coffee", "tip", "donate", "support you", "say thanks"],
    answer: "That's very kind of you! Coffee keeps the pipeline moving. ☕",
    pose: "coffee",
    action: { label: "Buy me a coffee", href: "https://www.buymeacoffee.com/lukedtimmsU" },
  },
  {
    q: "",
    keys: ["are you a bot", "are you real", "are you ai", "you a robot", "chatbot", "are you human", "who made you"],
    answer: "I'm a cartoon mini-me with answers from Luke's CV. Anything I can't answer, the real Luke is just a message away!",
    pose: "happy",
  },
  {
    q: "",
    keys: ["hello", "hi", "hey", "hiya", "morning", "afternoon", "evening"],
    answer: "Hi there! Ask me about my games, live events, how I work, or whether I'm open to new roles.",
    pose: "happy",
  },
  {
    q: "",
    keys: ["thanks", "thank you", "cheers", "great", "nice", "cool", "awesome"],
    answer: "You're welcome! If you'd like to chat properly, the contact form's at the bottom.",
    pose: "thumbs",
  },
];

window.MINIME_FALLBACK = {
  answer: "Hmm, I don't have an answer for that one. Try one of these, or tap below and ask the real me.",
  pose: "confused",
  action: { label: "Let's talk", contact: true },
};
