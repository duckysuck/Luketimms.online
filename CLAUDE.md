# luketimms.online: notes for coding agents

## Web standard: Modern Web Guidance

Every page on this site follows Google Chrome's
[Modern Web Guidance](https://github.com/GoogleChrome/modern-web-guidance).

- Before changing HTML, CSS or browser JavaScript, search the guidance for the
  pattern first, then follow the guide it returns:
  `npx -y modern-web-guidance@latest search "<2-5 word query>"`, then
  `npx -y modern-web-guidance@latest retrieve "<id>"`.
- Prefer what the browser already does (dialog, popover, form validation,
  view transitions, container queries) over extra JavaScript or new libraries.
- For a whole-site check, run `npx -y modern-web-guidance@latest legacy-scan . --json`
  and check each finding before changing anything. Last run 2026-11-18: 1 finding left
  (`layout2/index.html`, GSAP and Lenis from public CDNs without `integrity` hashes).
- The theme toggle follows the system setting unless the visitor overrides it, and
  mirrors the choice to `<meta name="color-scheme">`. Keep that when editing it.

**Browser support:** recruiters and hiring managers on any device. Use features that
are Baseline Widely available without fallbacks. Anything newer needs the fallback
the guide gives, so the page still works without it. No polyfill libraries.
