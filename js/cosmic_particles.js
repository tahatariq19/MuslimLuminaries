// Cosmic particles background logic
(function() {
  const colors = [
    '#fff', // white
    '#ffe066', // yellow
    '#a385ff', // purple
    '#7fdfff', // blue
    '#ffb3ec', // pink
    '#b5ffd9'  // teal
  ];

  function createCosmicParticles() {
    removeCosmicParticles();
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
    const particles = document.querySelectorAll('.particle');
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].remove();
    }
  }

  // Expose to a namespace instead of global
  window.particles = window.particles || {};
  window.particles.cosmic = { create: createCosmicParticles, remove: removeCosmicParticles };
})();
