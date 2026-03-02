window.ThemeManager.register({
	id: "glass-mesh",
	name: "Glass Mesh",
	useTilde: true,
	html: `
        <div class="theme-2-blobs" id="t2-blobs">
            <div class="t2-blob tb1"></div>
            <div class="t2-blob tb2"></div>
            <div class="t2-blob tb3"></div>
        </div>
    `,
	onMouseMove: (xPct, yPct) => {
		const blobs = document.getElementById("t2-blobs");
		if (blobs)
			blobs.style.transform = `translate(${(xPct - 0.5) * 40}px, ${(yPct - 0.5) * 40}px)`;
	},
});
