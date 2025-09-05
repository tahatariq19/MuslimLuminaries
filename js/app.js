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
    quotesList.innerHTML = '';
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

  // Restore saved background (if valid)
  try {
    const saved = localStorage.getItem(BG_KEY);
    if (saved) {
      const idx = backgrounds.indexOf(saved);
      if (idx !== -1) currentBg = idx;
    }
  } catch (e) { /* localStorage may be unavailable */ }

  function applyBackground(idx) {
    backgrounds.forEach((c) => document.body.classList.remove(c));
    document.body.classList.add(backgrounds[idx]);
    // Particle lifecycle hooks (if provided by separate scripts)
    if (backgrounds[idx] === 'bg-cosmic-particles' && typeof createCosmicParticles === 'function') {
      createCosmicParticles();
    } else if (typeof removeCosmicParticles === 'function') {
      removeCosmicParticles();
    }
    if (backgrounds[idx] === 'bg-nebula-particles' && typeof createNebulaParticles === 'function') {
      createNebulaParticles();
    } else if (typeof removeNebulaParticles === 'function') {
      removeNebulaParticles();
    }
    // Persist
    try { localStorage.setItem(BG_KEY, backgrounds[idx]); } catch (e) { /* ignore */ }
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
