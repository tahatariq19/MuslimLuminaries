// Show one quote at a time and cycle on click with animation
window.addEventListener('DOMContentLoaded', () => {
  const quotesList = document.getElementById('quotes-list');
  if (!quotesList || !window.quotes) return;

  let currentIndex = 0;
  let animating = false;

  function showQuote(index, animate = false) {
    const q = quotes[index];
    quotesList.innerHTML = `<div class='quote' id='quote-box'><span>${q.text}</span><span class='author'>- ${q.author}</span></div>`;
    const quoteBox = document.getElementById('quote-box');
    if (quoteBox) {
      quoteBox.onclick = function () {
        if (animating) return;
        animating = true;
        quoteBox.classList.add('quote-leave');
        quoteBox.addEventListener('animationend', function handleOut() {
          quoteBox.removeEventListener('animationend', handleOut);
          currentIndex = (currentIndex + 1) % quotes.length;
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

// No code change needed; #bg-toggle event binding works for both <button> and <span>.