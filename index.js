/**
 * Moonlit Splash — Silver Starlight
 * Lightweight startup splash enhancement for SillyTavern.
 * Does not replace the user's existing splash logo or modify SillyTavern core files.
 */

const SPLASH_SELECTOR = '#loader.splash-screen';
const ACTIVE_CLASS = 'mls-enhanced';
let startupObserver = null;
let observerTimeout = null;

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

    splash.prepend(makeStarfield());
    splash.classList.add(ACTIVE_CLASS);

    // Existing custom constellation / logo stays exactly as supplied by ST.
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
}
