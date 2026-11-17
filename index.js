/**
 * Moonlit Splash — Silver Starlight
 * Lightweight startup splash enhancement for SillyTavern.
 * Replaces only the default SillyTavern logo with a silver constellation.
 * Existing custom splash logos are preserved; no core files are modified.
 */

const SPLASH_SELECTOR = '#loader.splash-screen';
const ACTIVE_CLASS = 'mls-enhanced';
let startupObserver = null;
let observerTimeout = null;
let modifiedLogo = null;
let originalLogoSrc = null;

// A reproducible layout avoids sudden jumping when resize/repaints happen.
function seededRandom(seed) {
    return function () {
        seed |= 0;
        seed = (seed + 0x6D2B79F5) | 0;
        let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
        return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
}

function makeStarfield() {
    const field = document.createElement('div');
    field.className = 'mls-starfield';
    field.setAttribute('aria-hidden', 'true');

    const random = seededRandom(0x51A7BEEF);
    const mobile = window.matchMedia('(max-width: 720px)').matches;
    const starCount = mobile ? 14 : 20;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('span');
        star.className = 'mls-falling-star';

        // Some longer streaks, mostly tiny sparkles.
        const comet = i % 6 === 0;
        if (comet) star.classList.add('mls-comet');

        const x = 5 + random() * 90;
        const duration = 5.5 + random() * 6.0;
        const start = -(random() * duration);
        const drift = -40 + random() * 80;
        const size = 1.35 + random() * (comet ? 2.8 : 1.8);
        const opacity = 0.25 + random() * 0.48;
        const trail = (comet ? 42 : 16) + random() * (comet ? 34 : 18);

        star.style.setProperty('--mls-x', `${x.toFixed(2)}%`);
        star.style.setProperty('--mls-duration', `${duration.toFixed(2)}s`);
        star.style.setProperty('--mls-delay', `${start.toFixed(2)}s`);
        star.style.setProperty('--mls-drift', `${drift.toFixed(1)}px`);
        star.style.setProperty('--mls-size', `${size.toFixed(2)}px`);
        star.style.setProperty('--mls-opacity', opacity.toFixed(2));
        star.style.setProperty('--mls-trail', `${trail.toFixed(1)}px`);
        field.append(star);
    }

    return field;
}

// Tiny self-contained SVG: no file paths, fetches, image dependencies or external fonts.
const CONSTELLATION_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150" fill="none">
  <defs>
    <filter id="silverGlow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <g stroke="#e4effb" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity=".83" filter="url(#silverGlow)">
    <path d="M38 48 L77 31 L111 61 L148 39 M38 48 L56 98 L86 127 L133 100 L111 61"/>
  </g>
  <g fill="#f6faff" filter="url(#silverGlow)">
    <circle cx="38" cy="48" r="3.2"/><circle cx="77" cy="31" r="3"/>
    <circle cx="111" cy="61" r="3.9"/><circle cx="148" cy="39" r="3"/>
    <circle cx="56" cy="98" r="3"/><circle cx="86" cy="127" r="3.5"/>
    <circle cx="133" cy="100" r="3.1"/>
  </g>
  <g fill="#e2edf9" opacity=".65">
    <circle cx="166" cy="91" r="1.3"/><circle cx="45" cy="132" r="1.2"/>
    <circle cx="127" cy="21" r="1.1"/>
  </g>
</svg>`;

function replaceDefaultLogo(splash) {
    const logo = splash.querySelector('img.splash-logo');
    if (!logo) return;

    // Keep any user-installed custom constellation or alternate logo intact.
    const src = logo.getAttribute('src') || '';
    const isDefaultSTLogo = /(?:^|\/)img\/logo\.png(?:\?.*)?$/i.test(src);
    if (!isDefaultSTLogo) return;

    if (modifiedLogo && modifiedLogo !== logo) {
        modifiedLogo = null;
        originalLogoSrc = null;
    }
    if (modifiedLogo !== logo) {
        originalLogoSrc = src;
        modifiedLogo = logo;
    }

    logo.src = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(CONSTELLATION_SVG)}`;
    logo.alt = 'Silver constellation';
    logo.setAttribute('aria-label', 'Silver constellation');
    logo.classList.add('mls-constellation');
}

function enhanceSplash() {
    const splash = document.querySelector(SPLASH_SELECTOR);
    if (!splash) return false;
    if (splash.classList.contains(ACTIVE_CLASS)) return true;

    const message = splash.querySelector('.splash-message');
    if (!message) return false;

    // Keep SillyTavern's original localized "Initializing…" element intact.
    const textGroup = document.createElement('div');
    textGroup.className = 'mls-text-group';
    message.before(textGroup);
    textGroup.append(message);

    const subtitle = document.createElement('div');
    subtitle.className = 'mls-subtitle';
    subtitle.textContent = 'gathering silver starlight';
    textGroup.append(subtitle);

    // Replace only SillyTavern's default red logo. Custom logos are untouched.
    replaceDefaultLogo(splash);
    splash.prepend(makeStarfield());
    splash.classList.add(ACTIVE_CLASS);

    console.debug('[Moonlit Splash] Silver starlight splash enabled.');
    return true;
}

function stopObserving() {
    startupObserver?.disconnect();
    startupObserver = null;
    if (observerTimeout !== null) {
        clearTimeout(observerTimeout);
        observerTimeout = null;
    }
}

/** Called by SillyTavern during extension activation, before app initialization ends. */
export function onActivate() {
    if (enhanceSplash()) {
        stopObserving();
        return;
    }

    // Fallback for minor differences in initialization order.
    if (startupObserver || !document.documentElement) return;
    startupObserver = new MutationObserver(() => {
        if (enhanceSplash()) stopObserving();
    });
    startupObserver.observe(document.documentElement, {
        childList: true,
        subtree: true,
    });
    observerTimeout = setTimeout(stopObserving, 12000);
}

/** Restore the original splash presentation when disabled during a session. */
export function onDisable() {
    stopObserving();
    const splash = document.querySelector(`${SPLASH_SELECTOR}.${ACTIVE_CLASS}`);
    if (!splash) return;

    const group = splash.querySelector('.mls-text-group');
    const message = group?.querySelector('.splash-message');
    if (message && group) group.before(message);
    group?.remove();
    splash.querySelector('.mls-starfield')?.remove();
    splash.classList.remove(ACTIVE_CLASS);

    if (modifiedLogo && originalLogoSrc !== null) {
        modifiedLogo.setAttribute('src', originalLogoSrc);
        modifiedLogo.alt = 'SillyTavern';
        modifiedLogo.setAttribute('aria-label', 'SillyTavern Logo');
        modifiedLogo.classList.remove('mls-constellation');
    }
    modifiedLogo = null;
    originalLogoSrc = null;
}
