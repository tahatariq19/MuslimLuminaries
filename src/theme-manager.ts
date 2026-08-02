import type { ThemeConfig } from './types'

// Static map of theme id -> dynamic import. Each theme module imports its own
// CSS, so loading the module injects the stylesheet (Vite handles code-splitting
// and CSS injection). This preserves the old lazy-load behavior idiomatically.
const themeLoaders: Record<string, () => Promise<{ default: ThemeConfig }>> = {
	'twinkling-night': () => import('./themes/twinkling-night.ts'),
	'glass-mesh': () => import('./themes/glass-mesh.ts'),
	'dark-cosmic': () => import('./themes/dark-cosmic.ts'),
	'aurora-glow': () => import('./themes/aurora-glow.ts'),
}

class ThemeManager {
	private availableThemes = ['twinkling-night', 'glass-mesh', 'dark-cosmic', 'aurora-glow']
	private themes: ThemeConfig[] = []
	private currentThemeIndex = 0
	private activeThemeId: string | null = null
	private isInitialized = false
	private toastTimer: ReturnType<typeof setTimeout> | undefined

	register(themeConfig: ThemeConfig) {
		this.themes.push(themeConfig)

		// Inject layer for the newly loaded theme
		const bgContainer = document.getElementById('backgrounds-container')
		if (bgContainer) {
			const layer = document.createElement('div')
			layer.className = `layer l-${themeConfig.id}`
			if (themeConfig.html) layer.innerHTML = themeConfig.html
			bgContainer.appendChild(layer)
			if (themeConfig.init) {
				try {
					themeConfig.init()
				} catch (err) {
					console.error(
						`ThemeManager: Error initializing theme "${themeConfig.id}":`,
						err,
					)
				}
			}
		}
	}

	async loadTheme(themeId: string): Promise<void> {
		if (this.themes.find(t => t.id === themeId)) return

		const loader = themeLoaders[themeId]
		if (!loader) throw new Error(`Unknown theme "${themeId}"`)

		const mod = await loader()
		this.register(mod.default)
	}

	private getSavedTheme(): string | null {
		try {
			return localStorage.getItem('lastSelectedTheme')
		} catch {
			return null
		}
	}

	private setSavedTheme(id: string) {
		try {
			localStorage.setItem('lastSelectedTheme', id)
		} catch {
			// Ignore quota or disabled storage errors
		}
	}

	async initAll(onReady: () => void) {
		if (this.isInitialized) return
		this.isInitialized = true

		const bgContainer = document.getElementById('backgrounds-container')
		if (bgContainer) bgContainer.replaceChildren()

		const savedThemeId = this.getSavedTheme()
		let targetThemeId =
			savedThemeId && this.availableThemes.includes(savedThemeId)
				? savedThemeId
				: 'twinkling-night'

		this.currentThemeIndex = this.availableThemes.indexOf(targetThemeId)

		await this.loadTheme(targetThemeId).catch(() => {
			console.warn(`Failed to load theme "${targetThemeId}", falling back to default.`)
			targetThemeId = 'twinkling-night'
			this.currentThemeIndex = 0
			return this.loadTheme(this.availableThemes[0])
		})
		this.switchTheme()
		onReady()

		// Silently pre-fetch remaining themes
		setTimeout(() => {
			this.availableThemes.forEach(id => {
				if (id !== targetThemeId) {
					this.loadTheme(id).catch(err => {
						console.warn(`Failed to preload theme "${id}":`, err)
					})
				}
			})
		}, 1000)

		// Parallax handler with reduced-motion and active handler check
		let ticking = false
		document.addEventListener('mousemove', e => {
			if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
			const activeTheme = this.getActiveTheme()
			if (!activeTheme?.onMouseMove) return

			if (!ticking) {
				requestAnimationFrame(() => {
					if (activeTheme.onMouseMove) {
						activeTheme.onMouseMove(
							e.clientX / window.innerWidth,
							e.clientY / window.innerHeight,
						)
					}
					ticking = false
				})
				ticking = true
			}
		})
	}

	switchTheme() {
		const targetThemeId = this.availableThemes[this.currentThemeIndex]
		const activeTheme = this.themes.find(t => t.id === targetThemeId)
		if (!activeTheme) return

		// Clean up the previously active theme
		if (this.activeThemeId && this.activeThemeId !== activeTheme.id) {
			const oldTheme = this.themes.find(t => t.id === this.activeThemeId)
			if (oldTheme?.onDeactivate) {
				try {
					oldTheme.onDeactivate()
				} catch (err) {
					console.error(`ThemeManager: Error deactivating theme "${oldTheme.id}":`, err)
				}
			}
		}

		document.body.className = `theme-${activeTheme.id}`
		this.setSavedTheme(activeTheme.id)
		this.activeThemeId = activeTheme.id

		// Activate the new theme
		if (activeTheme.onActivate) {
			try {
				activeTheme.onActivate()
			} catch (err) {
				console.error(`ThemeManager: Error activating theme "${activeTheme.id}":`, err)
			}
		}

		const toast = document.getElementById('theme-toast')
		if (toast) {
			toast.textContent = activeTheme.name
			toast.classList.add('show')
			clearTimeout(this.toastTimer)
			this.toastTimer = setTimeout(() => toast.classList.remove('show'), 2000)
		}

		const container = document.getElementById('quote-container')
		if (container) {
			container.style.transform = 'scale(1)'
		}
	}

	async nextTheme() {
		const nextIndex = (this.currentThemeIndex + 1) % this.availableThemes.length
		const targetThemeId = this.availableThemes[nextIndex]
		try {
			await this.loadTheme(targetThemeId)
			this.currentThemeIndex = nextIndex
			this.switchTheme()
		} catch (err) {
			console.warn(`Failed to load next theme "${targetThemeId}":`, err)
		}
	}

	getActiveTheme(): ThemeConfig {
		const targetThemeId = this.availableThemes[this.currentThemeIndex]
		return (
			this.themes.find(t => t.id === targetThemeId) || { id: '', name: '', useTilde: false }
		)
	}
}

export const themeManager = new ThemeManager()
