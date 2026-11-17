<img width="2469" height="1405" alt="image" src="https://github.com/user-attachments/assets/6a79709a-3c82-436c-a0ef-cc5faf39fa23" />


# Moonlit Splash — Silver Starlight ✦

A lightweight, silver-toned startup screen effect for **SillyTavern**.

Instead of the spinning gear/star during initialization, silver stars slowly fall across the screen with fine, luminous trails. The original **Initializing…** heading fades in elegantly, followed by:

> *gathering silver starlight*

Your existing splash logo (including a custom constellation) remains unchanged. No SillyTavern core files need to be edited.

## Features

- ✦ Soft falling stars; selected stars have longer, comet-like tails
- ✦ Subtle silver-white glows with a dark-theme-friendly appearance
- ✦ Smooth fade/slide entrance for the original localized `Initializing…` heading
- ✦ Subtitle: *gathering silver starlight*
- ✦ Hides the existing gear/star only on the startup splash screen
- ✦ Lightweight: CSS animations, no continuous JS drawing loop, no libraries, no external assets
- ✦ Honors the OS `prefers-reduced-motion` accessibility preference
- ✦ Safe DOM augmentation: no changes to `public/script.js` or `public/css/loader.css`

## Install from GitHub

1. Upload the files `manifest.json`, `index.js`, `style.css`, and `README.md` to the **root** of a public GitHub repository (recommended name: `ST-Moonlit-Splash`).
2. In SillyTavern, open **Extensions → Install Extension**.
3. Paste the repository URL, e.g. `https://github.com/nothingsuspiciousright/ST-Moonlit-Splash` **after the repository has been created**.
4. Install and reload the browser page.

For a local installation, place the same folder under `data/<user-handle>/extensions/` (user-scoped) or the `public/scripts/extensions/third-party/` directory (server-scoped, depending on your installation).

## Notes and compatibility

- The effect starts once SillyTavern loads and activates client extensions, while the startup loader is still visible. There may be a brief interval showing the original loader **before** extension activation; a third-party extension cannot replace the earliest stage of boot without modifying the core.
- Tested with a simulated SillyTavern loader DOM. The actual timing of the animation may vary across SillyTavern versions, devices, and installed extensions.
- If the loader finishes very quickly, the animation may be visible only briefly.
- If you set *Reduced Motion* at the OS level, falling animation is disabled.
- To modify the subtitle, change `subtitle.textContent` in `index.js`.
- To adjust the number of stars, edit `starCount` in `index.js`.
- The source does **not** require a separate custom logo image. Whatever the current SillyTavern splash uses is kept.

## Files

- `manifest.json` — extension metadata and early activation hook.
- `index.js` — one-time DOM injection: starfield and subtitle.
- `style.css` — starfall, tails, glow, text entrance, and mobile styling.

## License

MIT — see `LICENSE`.
