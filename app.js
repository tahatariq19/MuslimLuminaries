// === Quote Manager & Logic ===
const QuoteManager = {
	quotes: [],
	playlist: [],
	currentIndex: 0,
	seenCount: 0,

	init: function (data) {
		this.quotes = data;
		if (this.quotes.length > 0) {
			this.generatePlaylist();
		}
	},

	shuffle: (array) => {
		const newArr = [...array];
		for (let i = newArr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[newArr[i], newArr[j]] = [newArr[j], newArr[i]];
		}
		return newArr;
	},

	generatePlaylist: function () {
		const quotesByAuthor = {};
		this.quotes.forEach((q) => {
			if (!quotesByAuthor[q.author]) quotesByAuthor[q.author] = [];
			quotesByAuthor[q.author].push(q);
		});

		// Shuffle each author's quotes internally
		for (const author in quotesByAuthor) {
			quotesByAuthor[author] = this.shuffle(quotesByAuthor[author]);
		}

		const authors = Object.keys(quotesByAuthor);
		const newPlaylist = [];
		let round = 0;

		while (true) {
			let roundAuthors = authors.filter(
				(a) => quotesByAuthor[a].length > round,
			);
			if (roundAuthors.length === 0) break;

			// Shuffle authors for this round
			roundAuthors = this.shuffle(roundAuthors);
			roundAuthors.forEach((a) => {
				newPlaylist.push(quotesByAuthor[a][round]);
			});
			round++;
		}

		this.playlist = newPlaylist;
		// Always start at the top. Randomness comes from the builder itself:
		// each round shuffles its author order, and each author's quote pool
		// is also shuffled — so every load produces a genuinely different sequence.
		this.currentIndex = 0;
		this.seenCount = 0;
	},

	next: function () {
		if (this.playlist.length === 0) return null;
		const quote = this.playlist[this.currentIndex];

		this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
		this.seenCount++;

		// When we've seen everything once, reshuffle and start a new randomized cycle
		if (this.seenCount >= this.playlist.length) {
			this.generatePlaylist();
		}

		return quote;
	},
};

const rawQuotes = typeof getQuotesData === "function" ? getQuotesData() : [];
QuoteManager.init(rawQuotes);

let isFirstLoad = true;
let animating = false;

// === Theme Management System ===
window.ThemeManager = {
	availableThemes: ['twinkling-night', 'glass-mesh', 'dark-cosmic', 'aurora-glow'],
	themes: [],
	currentThemeIndex: 0,
	isInitialized: false,

	register: function (themeConfig) {
		this.themes.push(themeConfig);

		// Inject layer for the newly loaded theme
		const bgContainer = document.getElementById("backgrounds-container");
		if (bgContainer) {
			const layer = document.createElement("div");
			layer.className = `layer l-${themeConfig.id}`;
			if (themeConfig.html) layer.innerHTML = themeConfig.html;
			bgContainer.appendChild(layer);
			if (themeConfig.init) themeConfig.init();
		}
	},

	loadTheme: function (themeId) {
		return new Promise((resolve, reject) => {
			if (this.themes.find(t => t.id === themeId)) return resolve();

			let loaded = 0;
			let failed = false;
			const check = () => { if (++loaded === 2) { failed ? reject(new Error(`Theme "${themeId}" failed to load`)) : resolve(); } };
			const fail = () => { failed = true; check(); };

			const link = document.createElement("link");
			link.rel = "stylesheet";
			link.href = `themes/${themeId}/${themeId}.css`;
			link.onload = check;
			link.onerror = fail;
			document.head.appendChild(link);

			const script = document.createElement("script");
			script.src = `themes/${themeId}/${themeId}.js`;
			script.onload = check;
			script.onerror = fail;
			document.body.appendChild(script);
		});
	},

	genStarsBoxShadow: (count, size, baseOpacity, colorful) => {
		let shadows = "";
		const colors = ["#ffffff", "#ffe9e9", "#e8eaff", "#fff0fb"];
		for (let i = 0; i < count; i++) {
			const x = (Math.random() * (colorful ? 100 : 150)).toFixed(2);
			const y = (Math.random() * (colorful ? 100 : 200)).toFixed(2);
			const op = (Math.random() * 0.5 + baseOpacity).toFixed(2);
			const color = colorful
				? colors[Math.floor(Math.random() * colors.length)]
				: "#ffffff";
			const hexOp = Math.floor(op * 255)
				.toString(16)
				.padStart(2, "0");
			shadows += `${x}vw ${y}vh 0 ${Math.random() * size}px ${
				colorful ? color + hexOp : `rgba(255,255,255,${op})`
			}${i < count - 1 ? "," : ""}`;
		}
		return shadows;
	},

	initAll: async function () {
		if (this.isInitialized) return;
		this.isInitialized = true;

		const bgContainer = document.getElementById("backgrounds-container");
		if (bgContainer) bgContainer.innerHTML = "";

		const savedThemeId = localStorage.getItem("lastSelectedTheme");
		let targetThemeId = savedThemeId;
		if (!this.availableThemes.includes(targetThemeId)) {
			targetThemeId = "twinkling-night";
		}
		this.currentThemeIndex = this.availableThemes.indexOf(targetThemeId);

		await this.loadTheme(targetThemeId).catch(() => {
			console.warn(`Failed to load theme "${targetThemeId}", falling back to default.`);
			this.currentThemeIndex = 0;
			return this.loadTheme(this.availableThemes[0]);
		});
		this.switchTheme();
		triggerNextQuote();

		// Silently pre-fetch remaining themes
		setTimeout(() => {
			this.availableThemes.forEach(id => {
				if (id !== targetThemeId) this.loadTheme(id).catch(() => {});
			});
		}, 1000);

		// Parallax handler
		document.addEventListener("mousemove", (e) => {
			const activeTheme = this.getActiveTheme();
			if (activeTheme?.onMouseMove) {
				activeTheme.onMouseMove(
					e.clientX / window.innerWidth,
					e.clientY / window.innerHeight,
				);
			}
		});
	},

	switchTheme: function () {
		const targetThemeId = this.availableThemes[this.currentThemeIndex];
		const activeTheme = this.themes.find(t => t.id === targetThemeId);
		if (!activeTheme) return;

		document.body.className = `theme-${activeTheme.id}`;
		localStorage.setItem("lastSelectedTheme", activeTheme.id);

		const toast = document.getElementById("theme-toast");
		if (toast) {
			toast.innerText = activeTheme.name;
			toast.classList.add("show");
			clearTimeout(this._toastTimer);
			this._toastTimer = setTimeout(
				() => toast.classList.remove("show"),
				2000,
			);
		}

		const container = document.getElementById("quote-container");
		if (container) {
			container.style.transform = "scale(1)";
		}
	},

	nextTheme: async function () {
		this.currentThemeIndex++;
		if (this.currentThemeIndex >= this.availableThemes.length) {
			this.currentThemeIndex = 0;
		}
		const targetThemeId = this.availableThemes[this.currentThemeIndex];
		await this.loadTheme(targetThemeId).catch(() => {});
		this.switchTheme();
	},

	getActiveTheme: function () {
		const targetThemeId = this.availableThemes[this.currentThemeIndex];
		return this.themes.find(t => t.id === targetThemeId) || { useTilde: false };
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
	if (!qLine || !qAuth || !container) return;

	const quote = QuoteManager.next();
	if (!quote) return;

	qLine.innerText = `"${quote.text}"`;

	const activeTheme = window.ThemeManager.getActiveTheme();
	qAuth.innerText = activeTheme.useTilde ? `~ ${quote.author}` : quote.author;

	container.classList.remove("exit");
	void container.offsetWidth; // trigger reflow
	container.classList.add("active");

	const charCount = quote.text.length;
	if (charCount > 300) {
		qLine.setAttribute('data-length', 'long');
	} else if (charCount > 150) {
		qLine.setAttribute('data-length', 'medium');
	} else {
		qLine.setAttribute('data-length', 'short');
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
