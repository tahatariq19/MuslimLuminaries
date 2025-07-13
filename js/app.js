// Render quotes from quotes.js into the page
window.addEventListener('DOMContentLoaded', () => {
  const quotesList = document.getElementById('quotes-list');
  if (!quotesList || !window.quotes) return;
  quotes.forEach(q => {
    const quoteDiv = document.createElement('div');
    quoteDiv.className = 'quote';
    quoteDiv.innerHTML = `<span>${q.text}</span><span class="author">- ${q.author}</span>`;
    quotesList.appendChild(quoteDiv);
  });
  // Placeholder: call animation function here if needed
  if (typeof animateQuotes === 'function') animateQuotes();
});