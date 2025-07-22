// Nebula particles background logic
function createNebulaParticles() {
  removeNebulaParticles();
  if (!document.body.classList.contains('bg-nebula-particles')) return;
  const colors = [
    '#fff', // white
    '#ffe066', // yellow
    '#a385ff', // purple
    '#7fdfff', // blue
    '#ffb3ec', // pink
    '#b5ffd9'  // teal
  ];
  for (let i = 0; i < 52; i++) {
    const s = document.createElement('div');
    s.className = 'nebula-star';
    if (Math.random() > 0.8) s.classList.add('glow');
    if (Math.random() > 0.85) s.classList.add('spiky');
    if (Math.random() > 0.6) s.classList.add('twinkle');
    const size = Math.random() * 7 + 2;
    s.style.width = s.style.height = `${size}px`;
    s.style.left = `${Math.random() * 100}%`;
    s.style.top = `-${Math.random() * 20 + 5}px`;
    s.style.background = colors[Math.floor(Math.random() * colors.length)];
    s.style.opacity = (Math.random() * 0.5 + 0.4).toFixed(2);
    s.style.animationDelay = `${Math.random() * 14}s`;
    if (s.classList.contains('twinkle')) {
      s.style.animationDelay += "," + (Math.random() * 2).toFixed(2) + "s";
    }
    document.body.appendChild(s);
  }
}
function removeNebulaParticles() {
  document.querySelectorAll('.nebula-star').forEach(s => s.remove());
}
