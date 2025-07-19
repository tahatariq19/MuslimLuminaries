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

  // Background switcher
  const bgButtons = document.querySelectorAll('.bg-switcher button');
  bgButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      document.body.classList.remove('bg-wavy-gradient'); // Add more as you add backgrounds
      document.body.classList.add(this.dataset.bg);
    });
  });
});