// Show one quote at a time and cycle on click
window.addEventListener('DOMContentLoaded', () => {
  const quotesList = document.getElementById('quotes-list');
  if (!quotesList || !window.quotes) return;

  let currentIndex = 0;

  function showQuote(index) {
    const q = quotes[index];
    quotesList.innerHTML = `<div class='quote' id='quote-box'><span>${q.text}</span><span class='author'>- ${q.author}</span></div>`;
    // Add click event to the quote itself
    const quoteBox = document.getElementById('quote-box');
    if (quoteBox) {
      quoteBox.onclick = function () {
        currentIndex = (currentIndex + 1) % quotes.length;
        showQuote(currentIndex);
      };
    }
  }

  showQuote(currentIndex);
});