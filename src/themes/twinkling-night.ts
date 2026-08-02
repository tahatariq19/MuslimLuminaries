import './twinkling-night.css'
import type { ThemeConfig } from '../types'

let t4AnimFrame = 0
let t4IsRunning = false
let t4Resize: (() => void) | undefined
let t4Draw: ((now: number) => void) | undefined
let lastTime = performance.now()
let accumulator = 0

const theme: ThemeConfig = {
	id: 'twinkling-night',
	name: 'Twinkling Night',
	useTilde: false,
	html: `
        <div class="theme-twinkling-night-sky"></div>
        <div class="milky-way"></div>
        <canvas class="theme-twinkling-night-stars" id="t4-canvas"></canvas>
    `,
	onActivate: () => {
		t4IsRunning = true
		if (t4Resize) window.addEventListener('resize', t4Resize)
		if (t4Draw) {
			const prefersReducedMotion = window.matchMedia(
				'(prefers-reduced-motion: reduce)',
			).matches
			if (t4AnimFrame) cancelAnimationFrame(t4AnimFrame)
			lastTime = performance.now()
			accumulator = 0
			if (!prefersReducedMotion) {
				t4AnimFrame = requestAnimationFrame(t4Draw)
			} else {
				t4Draw(performance.now())
			}
		}
	},
	onDeactivate: () => {
		t4IsRunning = false
		if (t4Resize) window.removeEventListener('resize', t4Resize)
		if (t4AnimFrame) {
			cancelAnimationFrame(t4AnimFrame)
			t4AnimFrame = 0
		}
	},
	init: () => {
		const canvas = document.getElementById('t4-canvas') as HTMLCanvasElement | null
		if (!canvas) return
		const ctx = canvas.getContext('2d')
		if (!ctx) return

		// --- Canvas Setup (High-DPI Retina Support) ---
		t4Resize = () => {
			const dpr = window.devicePixelRatio || 1
			canvas.width = window.innerWidth * dpr
			canvas.height = window.innerHeight * dpr
		}
		t4Resize()

		// --- Pre-computed Color Data ---
		const colorHex = ['#ffffff', '#ffe9e9', '#e8eaff', '#fff0fb', '#d4eeff']

		const STAR_COUNT = 450
		const stars: {
			x: number
			y: number
			baseSize: number
			isSparkle: boolean
			colorIdx: number
			lifespan: number
			invLifespan: number
			totalCycle: number
			age: number
		}[] = []

		// Pre-compute the 4-point star path as a reusable Path2D
		const sparklePathUnit = new Path2D()
		const steps = 24
		for (let s = 0; s <= steps; s++) {
			const t = (s / steps) * Math.PI * 2
			const px = Math.cos(t) ** 3
			const py = Math.sin(t) ** 3
			if (s === 0) sparklePathUnit.moveTo(px, py)
			else sparklePathUnit.lineTo(px, py)
		}
		sparklePathUnit.closePath()

		// Shared constants
		const TWO_PI = Math.PI * 2
		const PI = Math.PI

		const createStar = (isInitial: boolean) => {
			const isSparkle = Math.random() > 0.94
			const baseSize = isSparkle ? Math.random() * 8 + 4 : Math.random() * 1.5 + 0.5

			const lifespan = 3.5 + Math.random() * 3
			const sleepAfter = 0.5 + Math.random() * 1.5
			const totalCycle = lifespan + sleepAfter
			const age = isInitial ? Math.random() * totalCycle : 0

			return {
				x: Math.random(),
				y: Math.random(),
				baseSize,
				isSparkle,
				colorIdx: Math.floor(Math.random() * colorHex.length),
				lifespan,
				invLifespan: 1 / lifespan,
				totalCycle,
				age,
			}
		}

		const resetStar = (star: (typeof stars)[number]) => {
			star.x = Math.random()
			star.y = Math.random()
			star.isSparkle = Math.random() > 0.94
			star.baseSize = star.isSparkle ? Math.random() * 8 + 4 : Math.random() * 1.5 + 0.5
			star.colorIdx = Math.floor(Math.random() * colorHex.length)
			star.lifespan = 3.5 + Math.random() * 3
			star.invLifespan = 1 / star.lifespan
			const sleepAfter = 0.5 + Math.random() * 1.5
			star.totalCycle = star.lifespan + sleepAfter
			star.age = 0
		}

		// Initialize the pool
		for (let i = 0; i < STAR_COUNT; i++) {
			stars.push(createStar(true))
		}

		// --- Reduced Motion Cache ---
		const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
		let prefersReducedMotion = reducedMotionQuery.matches
		reducedMotionQuery.addEventListener('change', e => {
			prefersReducedMotion = e.matches
		})

		// --- Render Loop (throttled to ~30fps) ---
		const FRAME_INTERVAL = 1000 / 30 // ~33ms between draws

		t4Draw = (now: number) => {
			if (!t4IsRunning) return

			const elapsed = now - lastTime
			lastTime = now
			accumulator += elapsed

			// Only draw when enough time has passed for a 30fps frame
			if (accumulator >= FRAME_INTERVAL) {
				const dt = accumulator / 1000
				accumulator %= FRAME_INTERVAL

				const w = canvas.width
				const h = canvas.height
				ctx.clearRect(0, 0, w, h)

				for (let i = 0; i < STAR_COUNT; i++) {
					const s = stars[i]
					s.age += dt

					if (s.age >= s.totalCycle) {
						resetStar(s)
						continue
					}

					if (s.age >= s.lifespan) continue

					const progress = s.age * s.invLifespan
					const opacity = Math.sin(progress * PI)

					if (opacity < 0.02) continue

					const px = s.x * w
					const py = s.y * h

					// Use globalAlpha + solid hex color (zero string allocation)
					ctx.globalAlpha = opacity
					ctx.fillStyle = colorHex[s.colorIdx]

					if (s.isSparkle) {
						const scale = s.baseSize * 0.55 * (0.6 + opacity * 0.5)
						ctx.setTransform(scale, 0, 0, scale, px, py)
						ctx.fill(sparklePathUnit)
					} else {
						const radius = s.baseSize * 0.5 * (0.7 + opacity * 0.3)
						ctx.setTransform(1, 0, 0, 1, 0, 0)
						ctx.beginPath()
						ctx.arc(px, py, radius, 0, TWO_PI)
						ctx.fill()
					}
				}

				// Reset transform and alpha for next frame's clearRect
				ctx.setTransform(1, 0, 0, 1, 0, 0)
				ctx.globalAlpha = 1
			}

			// Respect prefers-reduced-motion preference and active state
			if (!prefersReducedMotion && t4IsRunning && t4Draw) {
				t4AnimFrame = requestAnimationFrame(t4Draw)
			}
		}
	},
}

export default theme
