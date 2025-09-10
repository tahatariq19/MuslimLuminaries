// Cosmic particles background logic
const createCosmicParticles = (function () {
  const colors = [
    "#fff", // white
    "#ffe066", // yellow
    "#a385ff", // purple
    "#7fdfff", // blue
    "#ffb3ec", // pink
    "#b5ffd9", // teal
  ];

  function create() {
    console.log("Creating cosmic particles");
    remove();
    // Scope particles to the background container. Fall back to body if container is missing.
    const container =
      document.getElementById("background-container") || document.body;
    for (let i = 0; i < 44; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      // mark particles with a specific modifier class so removals are scoped and safe
      p.classList.add("particle--cosmic");
      if (Math.random() > 0.8) p.classList.add("glow");
      if (Math.random() > 0.6) p.classList.add("twinkle");
      const size = Math.random() * 6 + 2;
      p.style.width = p.style.height = `${size}px`;
      p.style.left = `${Math.random() * 100}%`;
      p.style.top = `-${Math.random() * 20 + 5}px`;
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.opacity = (Math.random() * 0.5 + 0.4).toFixed(2);
      p.style.animationDelay = `${Math.random() * 12}s`;
      if (p.classList.contains("twinkle")) {
        p.style.animationDelay += "," + (Math.random() * 2).toFixed(2) + "s";
      }
      container.appendChild(p);
    }
    console.log("Cosmic particles created: 44 particles added");
  }

  function remove() {
    console.log("Removing cosmic particles");
    // scope removals to the background container to avoid affecting unrelated elements
    const container =
      document.getElementById("background-container") || document.body;
    const particles = container.querySelectorAll(".particle--cosmic");
    console.log(`Found ${particles.length} cosmic particles to remove`);
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].remove();
    }
    console.log("Cosmic particles removed");
  }

  return { create, remove };
})();
