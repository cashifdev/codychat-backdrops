# Changelog

## 1.0.0 (2026-11-25)
- First public release
- 4 animated chat backgrounds: Aurora, Constellation, Bubbles and Ocean Waves
- Every style reacts to the mouse and to touch: colours follow your pointer, stars reach out, bubbles get pushed and pop, waves swell. A tap or click adds a shockwave, a pop or a ripple
- Light and dark version of every style. Auto follows the chat theme, and members can choose Light or Dark themselves
- Built for phones and computers: a bottom sheet on phones, a centred window on desktop, fewer moving parts and 30 frames a second on phones (or a still picture, your choice)
- Admin panel: switch each style on or off and choose which ranks can use it (everyone, members, VIP, moderators, admins, super admins or owner only). The rank check also runs on the server
- Pick the backdrop for members who haven't chosen one, how busy the animation is, and where the button shows
- Live previews of every style, light and dark, in the admin panel, plus how many members use each one
- Members pick their backdrop from the + button next to the chat box or the Apps menu. Their choice is saved to their account
- Respects "reduce motion" (shows a still picture) and pauses when the tab is hidden
- Works on shared hosting: plain PHP and JavaScript, one small table, no WebSocket server and no Redis
- Optional credit line (on by default), which admins can turn off
