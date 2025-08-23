// Show one quote at a time and cycle on click with animation
window.addEventListener('DOMContentLoaded', () => {
  const quotesList = document.getElementById('quotes-list');
  if (!quotesList || !window.quotes) return;

  let currentIndex = 0;
  let animating = false;
  let shuffledQuotes = [];
  let shownIndices = [];
  let lastAuthor = null;

  function shuffleQuotes() {
    // Fisher-Yates shuffle
    const arr = quotes.map((q, i) => i);
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
    // Pick a random index to start
    const randIdx = Math.floor(Math.random() * shuffledQuotes.length);
    // Move the random index to the front
    [shuffledQuotes[0], shuffledQuotes[randIdx]] = [shuffledQuotes[randIdx], shuffledQuotes[0]];
  }

  function getNextQuoteIndex() {
    // Try to find the next quote with a different author
    for (let offset = 1; offset <= shuffledQuotes.length; offset++) {
      const idx = (currentIndex + offset) % shuffledQuotes.length;
      const quoteIdx = shuffledQuotes[idx];
      if (!shownIndices.includes(quoteIdx) && quotes[quoteIdx].author !== lastAuthor) {
        return idx;
      }
    }
    // If not found, try to find any unshown quote (to ensure all are displayed before reshuffling)
    for (let offset = 1; offset <= shuffledQuotes.length; offset++) {
      const idx = (currentIndex + offset) % shuffledQuotes.length;
      const quoteIdx = shuffledQuotes[idx];
      if (!shownIndices.includes(quoteIdx)) {
        return idx;
      }
    }
    // If still not found (all quotes have been shown), reshuffle
    return null;
  }

  function showQuote(index, animate = false) {
    const quoteIdx = shuffledQuotes[index];
    const q = quotes[quoteIdx];
    quotesList.innerHTML = `<div class='quote' id='quote-box'><span>${q.text}</span><span class='author'>~ ${q.author}</span></div>`;
    const quoteBox = document.getElementById('quote-box');
    if (quoteBox) {
      quoteBox.onclick = function () {
        if (animating) return;
        animating = true;
        quoteBox.classList.add('quote-leave');
        quoteBox.addEventListener('animationend', function handleOut() {
          quoteBox.removeEventListener('animationend', handleOut);
          // Mark this quote as shown
          shownIndices.push(shuffledQuotes[currentIndex]);
          lastAuthor = quotes[shuffledQuotes[currentIndex]].author;
          // If all quotes shown, reshuffle and start new cycle
          if (shownIndices.length >= quotes.length) {
            pickRandomStart();
          } else {
            // Find next valid quote
            let nextIdx = getNextQuoteIndex();
            if (nextIdx === null) {
              pickRandomStart();
              nextIdx = 0;
            }
            currentIndex = nextIdx;
          }
          // Replace with new quote and animate in
          showQuote(currentIndex, true);
        });
      };
      if (animate) {
        quoteBox.classList.add('quote-enter');
        quoteBox.addEventListener('animationend', function handleIn() {
          quoteBox.classList.remove('quote-enter');
          animating = false;
        }, { once: true });
      } else {
        animating = false;
      }
    }
  }

  // Initialize
  pickRandomStart();
  showQuote(currentIndex);

  // Multi-background toggle logic
  // List of available backgrounds (add more as you create them)
  const backgrounds = ['bg-nebula-particles', 'bg-wavy-gradient', 'bg-cosmic-particles'];
  let currentBg = 0;

  const bgToggle = document.getElementById('bg-toggle');
  if (bgToggle) {
    bgToggle.onclick = function() {
      document.body.classList.remove(backgrounds[currentBg]);
      if (backgrounds[currentBg] === 'bg-cosmic-particles' && typeof removeCosmicParticles === 'function') {
        removeCosmicParticles();
      }
      if (backgrounds[currentBg] === 'bg-nebula-particles' && typeof removeNebulaParticles === 'function') {
        removeNebulaParticles();
      }
      currentBg = (currentBg + 1) % backgrounds.length;
      document.body.classList.add(backgrounds[currentBg]);
      if (backgrounds[currentBg] === 'bg-cosmic-particles' && typeof createCosmicParticles === 'function') {
        createCosmicParticles();
      }
      if (backgrounds[currentBg] === 'bg-nebula-particles' && typeof createNebulaParticles === 'function') {
        createNebulaParticles();
      }
      this.blur(); // Remove focus highlight after click
    };
  }

  // If page loads with cosmic particles, create them
  if (document.body.classList.contains('bg-cosmic-particles') && typeof createCosmicParticles === 'function') {
    createCosmicParticles();
  }
  // If page loads with nebula particles, create them
  if (document.body.classList.contains('bg-nebula-particles') && typeof createNebulaParticles === 'function') {
    createNebulaParticles();
  }
});
