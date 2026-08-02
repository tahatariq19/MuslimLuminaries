import './glass-mesh.css'
import type { ThemeConfig } from '../types'

const theme: ThemeConfig = {
	id: 'glass-mesh',
	name: 'Glass Mesh',
	useTilde: true,
	html: `
        <div class="theme-glass-mesh-blobs" id="t2-blobs">
            <div class="glass-mesh-blob tb1"></div>
            <div class="glass-mesh-blob tb2"></div>
            <div class="glass-mesh-blob tb3"></div>
        </div>
    `,
	onMouseMove: (xPct, yPct) => {
		const blobs = document.getElementById('t2-blobs')
		if (blobs)
			blobs.style.transform = `translate(${(xPct - 0.5) * 40}px, ${(yPct - 0.5) * 40}px)`
	},
}

export default theme
