import './aurora-glow.css'
import type { ThemeConfig } from '../types'

const theme: ThemeConfig = {
	id: 'aurora-glow',
	name: 'Aurora Glow',
	useTilde: false,
	html: `
        <div class="noise-overlay"></div>
        <div class="theme-aurora-glow-container">
            <div class="light-beam b1"></div>
            <div class="light-beam b2"></div>
            <div class="light-beam b3"></div>
        </div>
    `,
}

export default theme
