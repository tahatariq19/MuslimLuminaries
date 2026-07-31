import './dark-cosmic.css'
import type { ThemeConfig } from '../types'

const theme: ThemeConfig = {
	id: "dark-cosmic",
	name: "Dark Cosmic",
	useTilde: false,
	html: `
        <div class="theme-dark-cosmic-bg" id="tc-bg"></div>
        <div class="theme-dark-cosmic-orbs" id="tc-orbs">
            <div class="glowing-orb"></div>
            <div class="glowing-orb-2"></div>
        </div>
        <div class="theme-dark-cosmic-stars-container">
            <div class="theme-dark-cosmic-stars" id="tc-s1"></div>
            <div class="theme-dark-cosmic-stars-fast" id="tc-s2"></div>
        </div>
    `,
	init: () => {
		const genStarsBoxShadow = (
			count: number,
			size: number,
			baseOpacity: number,
			colorful: boolean,
		): string => {
			let shadows = ""
			const colors = ["#ffffff", "#ffe9e9", "#e8eaff", "#fff0fb"]
			for (let i = 0; i < count; i++) {
				const x = (Math.random() * (colorful ? 100 : 150)).toFixed(2)
				const y = (Math.random() * (colorful ? 100 : 200)).toFixed(2)
				const opNum = Math.random() * 0.5 + baseOpacity
				const op = opNum.toFixed(2)
				const color = colorful
					? colors[Math.floor(Math.random() * colors.length)]
					: "#ffffff"
				const hexOp = Math.floor(opNum * 255)
					.toString(16)
					.padStart(2, "0")
				shadows += `${x}vw ${y}vh 0 ${Math.random() * size}px ${
					colorful ? color + hexOp : `rgba(255,255,255,${op})`
				}${i < count - 1 ? "," : ""}`
			}
			return shadows
		}

		const s1 = document.getElementById("tc-s1")
		const s2 = document.getElementById("tc-s2")
		if (s1)
			s1.style.boxShadow = genStarsBoxShadow(
				200,
				1,
				0.4,
				false,
			)
		if (s2)
			s2.style.boxShadow = genStarsBoxShadow(
				100,
				2,
				0.6,
				false,
			)
	},
	onMouseMove: (xPct, yPct) => {
		const bg = document.getElementById("tc-bg")
		const orbs = document.getElementById("tc-orbs")
		if (bg)
			bg.style.transform = `translate(${(xPct - 0.5) * 20}px, ${(yPct - 0.5) * 20}px)`
		if (orbs)
			orbs.style.transform = `translate(${(xPct - 0.5) * -40}px, ${(yPct - 0.5) * -40}px)`
	},
}

export default theme
