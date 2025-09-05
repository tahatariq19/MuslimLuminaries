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
  let lastAuthor = null;

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
    lastAuthor = null;
    if (shuffledQuotes.length > 1) {
      const randIdx = Math.floor(Math.random() * shuffledQuotes.length);
      [shuffledQuotes[0], shuffledQuotes[randIdx]] = [shuffledQuotes[randIdx], shuffledQuotes[0]];
    }
  }

  function getNextQuoteIndex() {
    for (let offset = 1; offset <= shuffledQuotes.length; offset++) {
      const idx = (currentIndex + offset) % shuffledQuotes.length;
      const quoteIdx = shuffledQuotes[idx];
      if (!shownIndices.includes(quoteIdx) && QUOTES[quoteIdx].author !== lastAuthor) {
        return idx;
      }
    }
    for (let offset = 1; offset <= shuffledQuotes.length; offset++) {
      const idx = (currentIndex + offset) % shuffledQuotes.length;
      const quoteIdx = shuffledQuotes[idx];
      if (!shownIndices.includes(quoteIdx)) return idx;
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
      lastAuthor = QUOTES[shuffledQuotes[currentIndex]].author;
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
    // Remove CSS if not needed
    // For simplicity, since CSS is small, we can keep them loaded
    // But for JS, we can remove scripts if needed, but it's tricky
    // For now, just keep loaded
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
    const assets = {
      'bg-nebula-particles': { css: 'css/nebula_particles.css', js: 'js/nebula_particles.js' },
      'bg-wavy-gradient': { css: 'css/wavy_gradient.css', js: null },
      'bg-cosmic-particles': { css: 'css/cosmic_particles.css', js: 'js/cosmic_particles.js' }
    };

    // Load CSS and JS if needed
    const promises = [];
    if (assets[bgClass].css) promises.push(loadCSS(assets[bgClass].css));
    if (assets[bgClass].js) promises.push(loadJS(assets[bgClass].js));

    try {
      await Promise.all(promises);
    } catch (e) {
      console.error('Failed to load assets for', bgClass, e);
    }

    backgrounds.forEach((c) => document.body.classList.remove(c));
    document.body.classList.add(bgClass);

    // Particle lifecycle hooks (using namespace)
    if (bgClass === 'bg-cosmic-particles' && window.particles && window.particles.cosmic) {
      window.particles.cosmic.create();
    } else if (window.particles && window.particles.cosmic) {
      window.particles.cosmic.remove();
    }
    if (bgClass === 'bg-nebula-particles' && window.particles && window.particles.nebula) {
      window.particles.nebula.create();
    } else if (window.particles && window.particles.nebula) {
      window.particles.nebula.remove();
    }
    // Persist
    try { localStorage.setItem(BG_KEY, bgClass); } catch (e) { /* ignore */ }
  }

  // Initial apply - ensure DOM is ready for particle creation
  applyBackground(currentBg);

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
