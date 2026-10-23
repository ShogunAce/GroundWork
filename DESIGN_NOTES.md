# Groundwork design notes

## Extracted intent
The supplied reference suggested calm confidence, sunlight, living plants, spacious composition, and a single approachable starting action. Groundwork interprets that as an editorial field journal rather than a glasshouse chatbot.

## Original direction
- Asymmetric split hero instead of the reference's centered input stack.
- Warm paper `#f5f3eb`, forest ink `#243c31`, deep green `#234c3b`, sage `#687468`, pale leaf `#dfe7b8`.
- Georgia editorial headings with Segoe UI/system sans for controls; all fonts local, no font CDN.
- Original sprout mark and original coded botanical creek illustration.
- Pill actions, a restrained evidence table, soft notebook panels and printable chapter structure.
- GSAP entrance and gently floating spoken fragments. Reduced-motion renders a static complete page. Dynamic import failures leave content visible.
- The workspace is a two-column dense grid on wide screens and a single flow on mobile.

## Asset inventory
- Original inline SVG creek illustration in `web/app/page.tsx`; no external image dependency.
- `web/public/audio/workbook-ready.mp3`: original generated spoken reply, ElevenLabs multilingual v2, Eugene voice selected from the connected voice catalog. Muted by default.
- `web/public/img/creek.webp`: original ElevenLabs FLUX 2 Pro creek image, optimized to 1400px WebP. The coded scene remains a complete image-error fallback. No generated video is required for motion.

## Originality and checks
- [x] Different layout from the reference.
- [x] Original palette and type pairing.
- [x] Original motion implementation.
- [x] Original sprout mark, copy, illustration, and generated voice script.
- [x] No reference identity, logos, music, or hotlinked playback assets.
- [x] Seven requested viewport widths checked in the browser.
- [x] Input text is at least 16px; reduced motion and mobile menu tested.

The brief's functionality and reliability requirements take precedence over conflicting skill preferences for ornamental scroll effects or font choices.
