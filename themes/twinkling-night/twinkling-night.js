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

		// --- Pre-computed Color Data ---
		// Store as hex strings (set once) + use globalAlpha for opacity
		// This eliminates 450+ rgba() string allocations per frame
		const colorHex = ["#ffffff", "#ffe9e9", "#e8eaff", "#fff0fb", "#d4eeff"];

		const STAR_COUNT = 450;
		const stars = [];

		// Pre-compute the 4-point star path as a reusable Path2D
		// Reduced from 80 to 24 segments — visually identical at these sizes
		const sparklePathUnit = new Path2D();
		const steps = 24;
		for (let s = 0; s <= steps; s++) {
			const t = (s / steps) * Math.PI * 2;
			const px = Math.cos(t) ** 3;
			const py = Math.sin(t) ** 3;
			if (s === 0) sparklePathUnit.moveTo(px, py);
			else sparklePathUnit.lineTo(px, py);
		}
		sparklePathUnit.closePath();

		// Shared constants
		const TWO_PI = Math.PI * 2;
		const PI = Math.PI;

		const createStar = (isInitial) => {
			const isSparkle = Math.random() > 0.94;
			const baseSize = isSparkle
				? Math.random() * 8 + 4
				: Math.random() * 1.5 + 0.5;

			const lifespan = 3.5 + Math.random() * 3;
			const sleepAfter = 0.5 + Math.random() * 1.5;
			const totalCycle = lifespan + sleepAfter;
			const age = isInitial ? Math.random() * totalCycle : 0;

			return {
				x: Math.random(),
				y: Math.random(),
				baseSize,
				isSparkle,
				colorIdx: Math.floor(Math.random() * colorHex.length),
				lifespan,
				invLifespan: 1 / lifespan, // Pre-compute division
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
			star.colorIdx = Math.floor(Math.random() * colorHex.length);
			star.lifespan = 3.5 + Math.random() * 3;
			star.invLifespan = 1 / star.lifespan;
			const sleepAfter = 0.5 + Math.random() * 1.5;
			star.totalCycle = star.lifespan + sleepAfter;
			star.age = 0;
		};

		// Initialize the pool
		for (let i = 0; i < STAR_COUNT; i++) {
			stars.push(createStar(true));
		}

		// --- Render Loop (throttled to ~30fps) ---
		let lastTime = performance.now();
		const FRAME_INTERVAL = 1000 / 30; // ~33ms between draws
		let accumulator = 0;

		const draw = (now) => {
			const elapsed = now - lastTime;
			lastTime = now;
			accumulator += elapsed;

			// Only draw when enough time has passed for a 30fps frame
			if (accumulator >= FRAME_INTERVAL) {
				const dt = accumulator / 1000;
				accumulator = 0;

				const w = canvas.width;
				const h = canvas.height;
				ctx.clearRect(0, 0, w, h);

				for (let i = 0; i < STAR_COUNT; i++) {
					const s = stars[i];
					s.age += dt;

					if (s.age >= s.totalCycle) {
						resetStar(s);
						continue;
					}

					if (s.age >= s.lifespan) continue;

					const progress = s.age * s.invLifespan; // Multiply instead of divide
					const opacity = Math.sin(progress * PI);

					if (opacity < 0.02) continue;

					const px = s.x * w;
					const py = s.y * h;

					// Use globalAlpha + solid hex color (zero string allocation)
					ctx.globalAlpha = opacity;
					ctx.fillStyle = colorHex[s.colorIdx];

					if (s.isSparkle) {
						const scale = s.baseSize * 0.55 * (0.6 + opacity * 0.5);
						// Use setTransform instead of save/translate/scale/restore
						ctx.setTransform(scale, 0, 0, scale, px, py);
						ctx.fill(sparklePathUnit);
					} else {
						const radius = s.baseSize * 0.5 * (0.7 + opacity * 0.3);
						// Reset transform for arc drawing
						ctx.setTransform(1, 0, 0, 1, 0, 0);
						ctx.beginPath();
						ctx.arc(px, py, radius, 0, TWO_PI);
						ctx.fill();
					}
				}

				// Reset transform and alpha for next frame's clearRect
				ctx.setTransform(1, 0, 0, 1, 0, 0);
				ctx.globalAlpha = 1;
			}

			window.t4AnimFrame = requestAnimationFrame(draw);
		};

		window.t4AnimFrame = requestAnimationFrame(draw);
	},
});
