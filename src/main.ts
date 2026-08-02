import './style.css'
import { quoteManager } from './quote-manager'
import { quotes } from './quotes'
import { themeManager } from './theme-manager'

quoteManager.init(quotes)

let isFirstLoad = true
let animating = false

function triggerNextQuote() {
	const container = document.getElementById('quote-container')
	if (animating || !container) return
	animating = true

	if (!isFirstLoad) {
		container.classList.remove('active')
		container.classList.add('exit')
		setTimeout(updateContent, 400) // Wait for exit
	} else {
		isFirstLoad = false
		updateContent()
	}
}

function updateContent() {
	const qLine = document.getElementById('quote-text')
	const qAuth = document.getElementById('quote-author')
	const container = document.getElementById('quote-container')
	if (!qLine || !qAuth || !container) return

	const quote = quoteManager.next()
	if (!quote) return

	qLine.innerText = `"${quote.text}"`

	const activeTheme = themeManager.getActiveTheme()
	qAuth.innerText = activeTheme.useTilde ? `~ ${quote.author}` : quote.author

	container.classList.remove('exit')
	requestAnimationFrame(() => {
		container.classList.add('active')
	})

	const charCount = quote.text.length
	if (charCount > 300) {
		qLine.setAttribute('data-length', 'long')
	} else if (charCount > 150) {
		qLine.setAttribute('data-length', 'medium')
	} else {
		qLine.setAttribute('data-length', 'short')
	}

	setTimeout(() => (animating = false), 500)
}

document.addEventListener('DOMContentLoaded', () => {
	// Theme Toggle Listener
	const themeBtn = document.getElementById('theme-btn')
	if (themeBtn) {
		themeBtn.addEventListener('click', e => {
			e.stopPropagation() // prevent triggering next quote
			themeManager.nextTheme()
		})
	}

	// Interaction Events
	document.body.addEventListener('click', e => {
		if ((e.target as HTMLElement).closest('.theme-toggle-btn')) return
		const selection = window.getSelection()
		if (selection && selection.toString().trim().length > 0) return
		triggerNextQuote()
	})
	document.addEventListener('keydown', e => {
		if (e.code === 'Space' || e.code === 'Enter') {
			const activeEl = document.activeElement
			const isInteractive =
				activeEl &&
				(activeEl.tagName === 'BUTTON' ||
					activeEl.tagName === 'A' ||
					activeEl.tagName === 'INPUT' ||
					activeEl.tagName === 'TEXTAREA' ||
					activeEl.tagName === 'SELECT')
			if (!isInteractive) triggerNextQuote()
		}
		if (e.code === 'KeyT') themeManager.nextTheme()
	})

	// Initial check — themeManager.initAll loads the saved theme, then triggers
	// the first quote once the active theme is ready.
	themeManager.initAll(triggerNextQuote)
})
