// Show one quote at a time and cycle on click
window.addEventListener('DOMContentLoaded', () => {
  const quotesList = document.getElementById('quotes-list');
  if (!quotesList || !window.quotes) return;

  let currentIndex = 0;

  function showQuote(index) {
    const q = quotes[index];
    quotesList.innerHTML = `<div class='quote' id='quote-box'><span>${q.text}</span><span class='author'>- ${q.author}</span></div>`;
  }

  showQuote(currentIndex);

  quotesList.onclick = function () {
    currentIndex = (currentIndex + 1) % quotes.length;
    showQuote(currentIndex);
  };
});