// Cosmic particles background logic
function createCosmicParticles() {
  removeCosmicParticles();
  if (!document.body.classList.contains('bg-cosmic-particles')) return;
  for (let i = 0; i < 32; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.width = p.style.height = `${Math.random() * 4 + 2}px`;
    p.style.left = `${Math.random() * 100}%`;
    p.style.top = `-${Math.random() * 20 + 5}px`;
    p.style.background = Math.random() > 0.7 ? '#ffe066' : '#fff'; // some yellowish stars
    p.style.animationDelay = `${Math.random() * 10}s`;
    document.body.appendChild(p);
  }
}
function removeCosmicParticles() {
  document.querySelectorAll('.particle').forEach(p => p.remove());
}
