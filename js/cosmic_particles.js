// Cosmic particles background logic
function createCosmicParticles() {
  removeCosmicParticles();
  if (!document.body.classList.contains('bg-cosmic-particles')) return;
  const colors = [
    '#fff', // white
    '#ffe066', // yellow
    '#a385ff', // purple
    '#7fdfff', // blue
    '#ffb3ec', // pink
    '#b5ffd9'  // teal
  ];
  for (let i = 0; i < 44; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    if (Math.random() > 0.8) p.classList.add('glow');
    if (Math.random() > 0.6) p.classList.add('twinkle');
    const size = Math.random() * 6 + 2;
    p.style.width = p.style.height = `${size}px`;
    p.style.left = `${Math.random() * 100}%`;
    p.style.top = `-${Math.random() * 20 + 5}px`;
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.opacity = (Math.random() * 0.5 + 0.4).toFixed(2);
    p.style.animationDelay = `${Math.random() * 12}s`;
    if (p.classList.contains('twinkle')) {
      p.style.animationDelay += "," + (Math.random() * 2).toFixed(2) + "s";
    }
    document.body.appendChild(p);
  }
}
function removeCosmicParticles() {
  document.querySelectorAll('.particle').forEach(p => p.remove());
}
