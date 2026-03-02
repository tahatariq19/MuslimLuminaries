window.ThemeManager.register({
	id: "twinkling-night",
	name: "Twinkling Night",
	useTilde: false,
	html: `
        <div class="theme-4-sky"></div>
        <div class="milky-way"></div>
        <canvas class="theme-4-stars" id="t4-canvas"></canvas>
    `,
	init: () => {
		const canvas = document.getElementById("t4-canvas");
		if (!canvas) return;
		const ctx = canvas.getContext("2d");

		// Cancel any previous animation loop when theme is re-initialized
		if (window.t4AnimFrame) cancelAnimationFrame(window.t4AnimFrame);

		// --- Canvas Setup ---
		const resize = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};
		resize();
		window.addEventListener("resize", resize);

		// --- Star Data ---
		const colors = [
			[255, 255, 255], // white
			[255, 233, 233], // warm pink
			[232, 234, 255], // cool blue
			[255, 240, 251], // soft rose
			[212, 238, 255], // ice blue
		];

		const STAR_COUNT = 450;
		const stars = [];

		// Pre-compute the 4-point star path as a reusable Path2D
		// This is the hypocycloid curve, scaled to unit size (-1 to 1)
		const sparklePathUnit = new Path2D();
		const steps = 80;
		for (let s = 0; s <= steps; s++) {
			const t = (s / steps) * Math.PI * 2;
			// Astroid / 4-point star curve
			const px = Math.cos(t) ** 3;
			const py = Math.sin(t) ** 3;
			if (s === 0) sparklePathUnit.moveTo(px, py);
			else sparklePathUnit.lineTo(px, py);
		}
		sparklePathUnit.closePath();

		const createStar = (isInitial) => {
			const isSparkle = Math.random() > 0.94;
			const baseSize = isSparkle
				? Math.random() * 8 + 4
				: Math.random() * 1.5 + 0.5;

			const lifespan = 3.5 + Math.random() * 3; // 3.5s to 6.5s
			const sleepAfter = 0.5 + Math.random() * 1.5; // 0.5s to 2s pause after death
			const totalCycle = lifespan + sleepAfter;

			// If initial, randomize where in the cycle this star starts
			const age = isInitial ? Math.random() * totalCycle : 0;

			return {
				x: Math.random(), // 0-1 normalized
				y: Math.random(),
				baseSize,
				isSparkle,
				color: colors[Math.floor(Math.random() * colors.length)],
				lifespan,
				totalCycle,
				age,
			};
		};

		const resetStar = (star) => {
			star.x = Math.random();
			star.y = Math.random();
			star.isSparkle = Math.random() > 0.94;
			star.baseSize = star.isSparkle
				? Math.random() * 8 + 4
				: Math.random() * 1.5 + 0.5;
			star.color = colors[Math.floor(Math.random() * colors.length)];
			star.lifespan = 3.5 + Math.random() * 3;
			const sleepAfter = 0.5 + Math.random() * 1.5;
			star.totalCycle = star.lifespan + sleepAfter;
			star.age = 0;
		};

		// Initialize the pool
		for (let i = 0; i < STAR_COUNT; i++) {
			stars.push(createStar(true));
		}

		// --- Render Loop ---
		let lastTime = performance.now();

		const draw = (now) => {
			const dt = (now - lastTime) / 1000; // delta in seconds
			lastTime = now;

			ctx.clearRect(0, 0, canvas.width, canvas.height);

			for (let i = 0; i < STAR_COUNT; i++) {
				const s = stars[i];
				s.age += dt;

				// Recycle star when its full cycle (life + sleep) is done
				if (s.age >= s.totalCycle) {
					resetStar(s);
					continue;
				}

				// If in sleep phase, skip drawing
				if (s.age >= s.lifespan) continue;

				// Calculate opacity: fade in first half, fade out second half
				const progress = s.age / s.lifespan; // 0 to 1
				// Sine curve gives smooth fade-in / fade-out (0 -> 1 -> 0)
				const opacity = Math.sin(progress * Math.PI);

				if (opacity < 0.01) continue; // Skip nearly invisible stars

				const px = s.x * canvas.width;
				const py = s.y * canvas.height;
				const [r, g, b] = s.color;

				if (s.isSparkle) {
					// Draw the 4-point star using pre-computed path
					// Path is -1 to 1 (2 units wide), so halve the scale, then +10%
					const scale = s.baseSize * 0.55 * (0.6 + opacity * 0.5);
					ctx.save();
					ctx.translate(px, py);
					ctx.scale(scale, scale);
					ctx.fillStyle = `rgba(${r},${g},${b},${opacity})`;
					ctx.fill(sparklePathUnit);
					ctx.restore();
				} else {
					// Simple filled circle for dot stars
					const radius = s.baseSize * 0.5 * (0.7 + opacity * 0.3);
					ctx.beginPath();
					ctx.arc(px, py, radius, 0, Math.PI * 2);
					ctx.fillStyle = `rgba(${r},${g},${b},${opacity})`;
					ctx.fill();
				}
			}

			window.t4AnimFrame = requestAnimationFrame(draw);
		};

		window.t4AnimFrame = requestAnimationFrame(draw);
	},
});
