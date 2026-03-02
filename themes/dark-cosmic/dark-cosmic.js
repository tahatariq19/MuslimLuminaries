window.ThemeManager.register({
	id: "dark-cosmic",
	name: "Dark Cosmic",
	useTilde: false,
	html: `
        <div class="theme-1-bg" id="tc-bg"></div>
        <div class="theme-1-orbs" id="tc-orbs">
            <div class="glowing-orb"></div>
            <div class="glowing-orb-2"></div>
        </div>
        <div style="position:fixed; z-index:3; width:100%; height:100%; pointer-events:none;">
            <div class="theme-1-stars" id="tc-s1"></div>
            <div class="theme-1-stars-fast" id="tc-s2"></div>
        </div>
    `,
	init: () => {
		const s1 = document.getElementById("tc-s1");
		const s2 = document.getElementById("tc-s2");
		if (s1)
			s1.style.boxShadow = window.ThemeManager.genStarsBoxShadow(
				200,
				1,
				0.4,
				false,
			);
		if (s2)
			s2.style.boxShadow = window.ThemeManager.genStarsBoxShadow(
				100,
				2,
				0.6,
				false,
			);
	},
	onMouseMove: (xPct, yPct) => {
		const bg = document.getElementById("tc-bg");
		const orbs = document.getElementById("tc-orbs");
		if (bg)
			bg.style.transform = `translate(${(xPct - 0.5) * 20}px, ${(yPct - 0.5) * 20}px)`;
		if (orbs)
			orbs.style.transform = `translate(${(xPct - 0.5) * -40}px, ${(yPct - 0.5) * -40}px)`;
	},
});
