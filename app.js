// === Quote Logic & State ===
const quotes = typeof getQuotesData === "function" ? getQuotesData() : [];
let currentQuoteIndex = Math.floor(Math.random() * quotes.length);
let isFirstLoad = true;
let animating = false;

// === Theme Management System ===
window.ThemeManager = {
	themes: [],
	currentThemeIndex: 0,
	isInitialized: false,

	register: function (themeConfig) {
		console.log("Registering theme:", themeConfig.id);
		this.themes.push(themeConfig);
		// If app already DOM loaded, try to init
		if (
			document.readyState === "complete" ||
			document.readyState === "interactive"
		) {
			this.initAll();
		}
	},

	genStarsBoxShadow: (count, size, baseOpacity, colorful) => {
		let shadows = "";
		const colors = ["#ffffff", "#ffe9e9", "#e8eaff", "#fff0fb"];
		for (let i = 0; i < count; i++) {
			const x = Math.floor(
				Math.random() * window.innerWidth * (colorful ? 1 : 1.5),
			);
			const y = Math.floor(
				Math.random() * window.innerHeight * (colorful ? 1 : 2),
			);
			const op = (Math.random() * 0.5 + baseOpacity).toFixed(2);
			const color = colorful
				? colors[Math.floor(Math.random() * colors.length)]
				: "#ffffff";
			const hexOp = Math.floor(op * 255)
				.toString(16)
				.padStart(2, "0");
			shadows += `${x}px ${y}px 0 ${Math.random() * size}px ${
				colorful ? color + hexOp : `rgba(255,255,255,${op})`
			}${i < count - 1 ? "," : ""}`;
		}
		return shadows;
	},

	initAll: function () {
		if (this.isInitialized || this.themes.length === 0) return;

		const bgContainer = document.getElementById("backgrounds-container");
		if (!bgContainer) return;

		this.isInitialized = true;
		bgContainer.innerHTML = ""; // Clear

		// Inject theme html layers
		this.themes.forEach((t) => {
			const layer = document.createElement("div");
			layer.className = `layer l-${t.id}`;
			if (t.html) layer.innerHTML = t.html;
			bgContainer.appendChild(layer);
			if (t.init) t.init();
		});

		// Parallax handler
		document.addEventListener("mousemove", (e) => {
			const activeTheme = this.themes[this.currentThemeIndex];
			if (activeTheme?.onMouseMove) {
				activeTheme.onMouseMove(
					e.clientX / window.innerWidth,
					e.clientY / window.innerHeight,
				);
			}
		});

		// Set default theme to 'twinkling-night' if exists, or index 0
		const defaultIndex = this.themes.findIndex(
			(t) => t.id === "twinkling-night",
		);
		this.currentThemeIndex = defaultIndex !== -1 ? defaultIndex : 0;

		this.switchTheme();
		triggerNextQuote();
	},

	switchTheme: function () {
		if (this.themes.length === 0) return;
		const activeTheme = this.themes[this.currentThemeIndex];
		if (!activeTheme) return;

		document.body.className = `theme-${activeTheme.id}`;

		const toast = document.getElementById("theme-toast");
		if (toast) {
			toast.innerText = activeTheme.name;
			toast.classList.add("show");
			clearTimeout(window.toastTimer);
			window.toastTimer = setTimeout(
				() => toast.classList.remove("show"),
				2000,
			);
		}

		const container = document.getElementById("quote-container");
		if (container) {
			container.style.transform = "scale(1)";
		}
	},

	nextTheme: function () {
		if (this.themes.length === 0) return;
		this.currentThemeIndex++;
		if (this.currentThemeIndex >= this.themes.length)
			this.currentThemeIndex = 0;
		this.switchTheme();
	},

	getActiveTheme: function () {
		return this.themes[this.currentThemeIndex] || { useTilde: false };
	},
};

function triggerNextQuote() {
	const container = document.getElementById("quote-container");
	if (animating || !container) return;
	animating = true;

	if (!isFirstLoad) {
		container.classList.remove("active");
		container.classList.add("exit");
		setTimeout(updateContent, 400); // Wait for exit
	} else {
		isFirstLoad = false;
		updateContent();
	}
}

function updateContent() {
	const qLine = document.getElementById("quote-text");
	const qAuth = document.getElementById("quote-author");
	const container = document.getElementById("quote-container");
	if (quotes.length === 0 || !qLine || !qAuth || !container) return;

	const quote = quotes[currentQuoteIndex];
	currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;

	qLine.innerText = `"${quote.text}"`;

	const activeTheme = window.ThemeManager.getActiveTheme();
	qAuth.innerText = activeTheme.useTilde ? `~ ${quote.author}` : quote.author;

	container.classList.remove("exit");
	void container.offsetWidth; // trigger reflow
	container.classList.add("active");

	const charCount = quote.text.length;
	if (charCount > 300) {
		qLine.style.fontSize = "clamp(1rem, 2.5vw, 2rem)";
	} else if (charCount > 150) {
		qLine.style.fontSize = "clamp(1.2rem, 3vw, 2.5rem)";
	} else {
		qLine.style.fontSize = "clamp(1.5rem, 4.5vw, 3.5rem)";
	}

	setTimeout(() => (animating = false), 500);
}

document.addEventListener("DOMContentLoaded", () => {
	// Theme Toggle Listener
	const themeBtn = document.getElementById("theme-btn");
	if (themeBtn) {
		themeBtn.addEventListener("click", (e) => {
			e.stopPropagation(); // prevent triggering next quote
			window.ThemeManager.nextTheme();
		});
	}

	// Interaction Events
	document.body.addEventListener("click", (e) => {
		if (e.target.closest(".theme-toggle-btn")) return;
		triggerNextQuote();
	});
	document.addEventListener("keydown", (e) => {
		if (e.code === "Space" || e.code === "Enter") triggerNextQuote();
		if (e.code === "KeyT") window.ThemeManager.nextTheme();
	});

	// Initial check
	window.ThemeManager.initAll();
});
