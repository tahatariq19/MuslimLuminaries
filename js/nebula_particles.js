// Nebula particles background logic
const createNebulaParticles = (function() {
  const colors = [
    '#fff', // white
    '#ffe066', // yellow
    '#a385ff', // purple
    '#7fdfff', // blue
    '#ffb3ec', // pink
    '#b5ffd9'  // teal
  ];
  const duration = 14; // seconds, must match CSS

  function create() {
    remove();
    for (let i = 0; i < 52; i++) {
      const s = document.createElement('div');
      s.className = 'nebula-star';
      if (Math.random() > 0.8) s.classList.add('glow');
      if (Math.random() > 0.85) s.classList.add('spiky');
      if (Math.random() > 0.6) s.classList.add('twinkle');
      const size = Math.random() * 7 + 2;
      s.style.width = s.style.height = `${size}px`;
      s.style.left = `${Math.random() * 100}%`;
      s.style.top = `${Math.random() * 100}%`;
      s.style.background = colors[Math.floor(Math.random() * colors.length)];
      s.style.opacity = (Math.random() * 0.5 + 0.4).toFixed(2);
      // Give each particle a negative animation delay so it appears mid-animation
      const animDelay = -Math.random() * duration;
      s.style.animationDelay = `${animDelay}s`;
      if (s.classList.contains('twinkle')) {
        s.style.animationDelay += "," + (-Math.random() * 2).toFixed(2) + "s";
      }
      // Assign random direction and distance
      const angle = Math.random() * 2 * Math.PI;
      const deg = (angle * 180 / Math.PI).toFixed(2);
      const distance = (60 + Math.random() * 40).toFixed(2) + 'vh'; // Reduced from (80 + Math.random() * 60)
      s.style.setProperty('--angle', deg + 'deg');
      s.style.setProperty('--distance', distance);
      document.body.appendChild(s);
    }
  }

  function remove() {
    const stars = document.querySelectorAll('.nebula-star');
    for (let i = stars.length - 1; i >= 0; i--) {
      stars[i].remove();
    }
  }

  return { create, remove };
})();
