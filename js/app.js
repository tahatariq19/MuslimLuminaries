(function () {
 "use strict";

 document.addEventListener('DOMContentLoaded', function() {
 const quotesList = document.getElementById('quotes-list');
  if (!quotesList) return;

  // Read quotes from dedicated function
  const QUOTES = getQuotesData();

  // Shuffle state
  let currentIndex = 0;
  let animating = false;
  let shuffledQuotes = [];
  let shownIndices = [];

  function shuffleQuotes() {
    const arr = QUOTES.map((q, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function pickRandomStart() {
    shuffledQuotes = shuffleQuotes();
    shownIndices = [];
    currentIndex = 0;
    if (shuffledQuotes.length > 1) {
      const randIdx = Math.floor(Math.random() * shuffledQuotes.length);
      [shuffledQuotes[0], shuffledQuotes[randIdx]] = [shuffledQuotes[randIdx], shuffledQuotes[0]];
    }
  }

  function getNextQuoteIndex() {
    for (let offset = 1; offset <= shuffledQuotes.length; offset++) {
      const idx = (currentIndex + offset) % shuffledQuotes.length;
      const quoteIdx = shuffledQuotes[idx];
      if (!shownIndices.includes(quoteIdx)) {
        return idx;
      }
    }
    return null;
  }

  function buildQuoteElement(qObj) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'quote';
    btn.setAttribute('aria-live', 'polite');
    // Quote text
    const spanText = document.createElement('span');
    spanText.textContent = qObj.text;
    btn.appendChild(spanText);
    // Author
    const spanAuthor = document.createElement('span');
    spanAuthor.className = 'author';
    spanAuthor.textContent = `~ ${qObj.author}`;
    btn.appendChild(spanAuthor);
    return btn;
  }

  function showQuote(index, animate = false) {
    const quoteIdx = shuffledQuotes[index];
    const q = QUOTES[quoteIdx];
    // Clear container and append accessible button
    while (quotesList.firstChild) {
      quotesList.removeChild(quotesList.firstChild);
    }
    const quoteEl = buildQuoteElement(q);
    quoteEl.id = 'quote-box';

    // Click / keyboard activation handler
    quoteEl.addEventListener('click', triggerNext);
    quoteEl.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        triggerNext();
      }
    });

    if (animate) quoteEl.classList.add('quote-enter');
    quoteEl.addEventListener('animationend', function handleIn() {
      quoteEl.classList.remove('quote-enter');
      animating = false;
      quoteEl.removeEventListener('animationend', handleIn);
    }, { once: true });

    quotesList.appendChild(quoteEl);
    if (!animate) animating = false;
  }

  function triggerNext() {
    if (animating) return;
    const quoteBox = document.getElementById('quote-box');
    if (!quoteBox) return;
    animating = true;
    quoteBox.classList.add('quote-leave');
    quoteBox.addEventListener('animationend', function handleOut() {
      quoteBox.removeEventListener('animationend', handleOut);
      // Mark shown
      shownIndices.push(shuffledQuotes[currentIndex]);
      if (shownIndices.length >= QUOTES.length) {
        pickRandomStart();
      } else {
        let nextIdx = getNextQuoteIndex();
        if (nextIdx === null) {
          pickRandomStart();
          nextIdx = 0;
        }
        currentIndex = nextIdx;
      }
      showQuote(currentIndex, true);
    });
  }

  // Initialize quotes
  pickRandomStart();
  showQuote(currentIndex);

  // Background/theme handling with persistence
  const BG_KEY = 'ml:bg';
  const backgrounds = ['bg-nebula-particles', 'bg-wavy-gradient', 'bg-cosmic-particles'];
  let currentBg = 0;

  // Dynamic asset loading
  const loadedAssets = { css: new Set(), js: new Set() };

  function loadCSS(href) {
    if (loadedAssets.css.has(href)) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = () => {
        loadedAssets.css.add(href);
        resolve();
      };
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  function loadJS(src) {
    if (loadedAssets.js.has(src)) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        loadedAssets.js.add(src);
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function unloadAssets(bgClass) {
    const assets = {
      'bg-nebula-particles': { css: 'css/nebula_particles.css', js: 'js/nebula_particles.js' },
      'bg-wavy-gradient': { css: 'css/wavy_gradient.css', js: null },
      'bg-cosmic-particles': { css: 'css/cosmic_particles.css', js: 'js/cosmic_particles.js' }
    };

    // Get current assets needed
    const currentAssets = assets[bgClass];
    const neededCSS = currentAssets.css || null;
    // JS is never unloaded

    // Remove CSS that are not needed for current background
    const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
    cssLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('css/') && href !== neededCSS && loadedAssets.css.has(href)) {
        link.remove();
        loadedAssets.css.delete(href);
      }
    });

    // Do not remove JS scripts - keep functions loaded
  }

  // Restore saved background (if valid)
  try {
    const saved = localStorage.getItem(BG_KEY);
    if (saved) {
      const idx = backgrounds.indexOf(saved);
      if (idx !== -1) currentBg = idx;
    }
  } catch (e) { /* localStorage may be unavailable */ }

  async function applyBackground(idx) {
    const bgClass = backgrounds[idx];
    const backgroundContainer = document.getElementById('background-container');
    if (!backgroundContainer) return;

    const assets = {
      'bg-nebula-particles': { css: 'css/nebula_particles.css', js: 'js/nebula_particles.js' },
      'bg-wavy-gradient': { css: 'css/wavy_gradient.css', js: null },
      'bg-cosmic-particles': { css: 'css/cosmic_particles.css', js: 'js/cosmic_particles.js' }
    };

    // Unload previous assets before loading new ones
    unloadAssets(bgClass);

    // Load only CSS if needed (JS preloaded)
    const promises = [];
    if (assets[bgClass].css) promises.push(loadCSS(assets[bgClass].css));

    try {
      await Promise.all(promises);
    } catch (e) {
      console.error('Failed to load assets for', bgClass, e);
    }

    backgrounds.forEach((c) => backgroundContainer.classList.remove(c));
    backgroundContainer.classList.add(bgClass);

    // Particle lifecycle hooks
    if (bgClass === 'bg-cosmic-particles' && typeof createCosmicParticles !== 'undefined') {
      createCosmicParticles.create();
    } else if (typeof createCosmicParticles !== 'undefined') {
      createCosmicParticles.remove();
    }
    if (bgClass === 'bg-nebula-particles' && typeof createNebulaParticles !== 'undefined') {
      createNebulaParticles.create();
    } else if (typeof createNebulaParticles !== 'undefined') {
      createNebulaParticles.remove();
    }
    // Persist
    try { localStorage.setItem(BG_KEY, bgClass); } catch (e) { /* ignore */ }
  }

  // Preload JS files once
  Promise.all([
    loadJS('js/nebula_particles.js'),
    loadJS('js/cosmic_particles.js')
  ]).then(() => {
    // Initial apply - ensure DOM is ready for particle creation
    applyBackground(currentBg);
  }).catch(e => {
    console.error('Failed to preload JS', e);
    // Fallback to initial apply
    applyBackground(currentBg);
  });

  const bgToggle = document.getElementById('bg-toggle');
  if (bgToggle) {
    function handleToggle() {
      const prev = currentBg;
      currentBg = (currentBg + 1) % backgrounds.length;
      applyBackground(currentBg);
      bgToggle.setAttribute('aria-pressed', String(currentBg !== 0));
      bgToggle.blur();
    }
    bgToggle.addEventListener('click', handleToggle);
    // keyboard: allow T to toggle as a shortcut
    document.addEventListener('keydown', (ev) => {
      if ((ev.key === 't' || ev.key === 'T') && (ev.target === document.body || ev.target === document.documentElement)) {
        handleToggle();
      }
    });
  }
 });
})();
