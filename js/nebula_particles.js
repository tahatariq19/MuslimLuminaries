// Nebula particles background logic
const createNebulaParticles = (function () {
  const colors = [
    "#fff", // white
    "#ffe066", // yellow
    "#a385ff", // purple
    "#7fdfff", // blue
    "#ffb3ec", // pink
    "#b5ffd9", // teal
  ];
  const duration = 14; // seconds, must match CSS

  function create() {
    console.log("Creating nebula particles");
    const container = document.getElementById("background-container");
    if (!container) {
      console.error("Background container not found");
      return;
    }
    remove();

    // viewport height in pixels (used to convert vh distances to px)
    const vh = Math.max(
      document.documentElement.clientHeight || 0,
      window.innerHeight || 0,
    );

    for (let i = 0; i < 52; i++) {
      const s = document.createElement("div");
      s.className = "nebula-star";
      // mark nebula elements with a specific modifier class so removals are scoped and safe
      s.classList.add("nebula-star--bg");
      if (Math.random() > 0.8) s.classList.add("glow");
      if (Math.random() > 0.85) s.classList.add("spiky");
      if (Math.random() > 0.6) s.classList.add("twinkle");
      const size = Math.random() * 7 + 2;
      s.style.width = s.style.height = `${size}px`;
      s.style.left = `${Math.random() * 100}%`;
      s.style.top = `${Math.random() * 100}%`;
      s.style.background = colors[Math.floor(Math.random() * colors.length)];
      s.style.opacity = (Math.random() * 0.5 + 0.4).toFixed(2);

      // Give each particle a negative animation delay so it appears mid-animation
      const animDelay = -Math.random() * duration;
      s.style.animationDelay = `${animDelay}s`;
      if (s.classList.contains("twinkle")) {
        s.style.animationDelay += "," + (-Math.random() * 2).toFixed(2) + "s";
      }

      // Compute movement in JS and set pixel translations as CSS variables.
      // CSS cannot compute sin/cos, so compute dx/dy here and use --tx / --ty in CSS.
      const angle = Math.random() * 2 * Math.PI; // radians
      const distanceVh = 60 + Math.random() * 40; // in vh
      const distancePx = (distanceVh / 100) * vh; // convert to px
      const dx = Math.cos(angle) * distancePx;
      const dy = Math.sin(angle) * distancePx;

      s.style.setProperty("--tx", `${dx.toFixed(2)}px`);
      s.style.setProperty("--ty", `${dy.toFixed(2)}px`);

      // Keep legacy vars for compatibility if any CSS references remain (optional)
      const deg = ((angle * 180) / Math.PI).toFixed(2);
      s.style.setProperty("--angle", deg + "deg");
      s.style.setProperty("--distance", distanceVh.toFixed(2) + "vh");

      container.appendChild(s);
    }
    console.log("Nebula particles created: 52 stars added");
  }

  function remove() {
    console.log("Removing nebula particles");
    // scope removals to the background container so we don't affect unrelated elements
    const container =
      document.getElementById("background-container") || document.body;
    const stars = container.querySelectorAll(".nebula-star--bg");
    console.log(`Found ${stars.length} nebula stars to remove`);
    for (let i = stars.length - 1; i >= 0; i--) {
      stars[i].remove();
    }
    console.log("Nebula particles removed");
  }

  return { create, remove };
})();
