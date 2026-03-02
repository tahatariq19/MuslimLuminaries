window.ThemeManager.register({
	id: "twinkling-night",
	name: "Twinkling Night",
	useTilde: false,
	html: `
        <div class="theme-4-sky"></div>
        <div class="milky-way"></div>
        <div class="theme-4-stars">
            <div class="star-layer t4-s1" id="t4-s1"></div>
            <div class="star-layer t4-s2" id="t4-s2"></div>
            <div class="star-layer t4-s3" id="t4-s3"></div>
        </div>
    `,
	init: () => {
		["t4-s1", "t4-s2", "t4-s3"].forEach((id) => {
			const el = document.getElementById(id);
			if (el) {
				el.style.width = "1px";
				el.style.height = "1px";
				el.style.backgroundColor = "transparent";
			}
		});
		const s1 = document.getElementById("t4-s1");
		const s2 = document.getElementById("t4-s2");
		const s3 = document.getElementById("t4-s3");
		if (s1)
			s1.style.boxShadow = window.ThemeManager.genStarsBoxShadow(
				200,
				0.5,
				0.2,
				true,
			);
		if (s2)
			s2.style.boxShadow = window.ThemeManager.genStarsBoxShadow(
				100,
				1.2,
				0.4,
				true,
			);
		if (s3)
			s3.style.boxShadow = window.ThemeManager.genStarsBoxShadow(
				50,
				2.0,
				0.6,
				true,
			);
	},
});
