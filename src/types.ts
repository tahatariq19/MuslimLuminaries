export interface Quote {
	text: string
	author: string
}

export interface ThemeConfig {
	id: string
	name: string
	useTilde: boolean
	html?: string
	init?: () => void
	onActivate?: () => void
	onDeactivate?: () => void
	onMouseMove?: (xPct: number, yPct: number) => void
}
