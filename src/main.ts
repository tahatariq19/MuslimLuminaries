import './style.css'
import { quoteManager } from './quote-manager'
import { quotes } from './quotes'
import { themeManager } from './theme-manager'

quoteManager.init(quotes)

let isFirstLoad = true
let animating = false

let containerEl: HTMLElement | null = null
let qLineEl: HTMLElement | null = null
let qAuthEl: HTMLElement | null = null

function triggerNextQuote() {
	if (!containerEl) {
		containerEl = document.getElementById('quote-container')
	}
	if (animating || !containerEl) return
	animating = true

	if (!isFirstLoad) {
		containerEl.classList.remove('active')
		containerEl.classList.add('exit')
		setTimeout(updateContent, 400) // Wait for exit
	} else {
		isFirstLoad = false
		updateContent()
	}
}

function updateContent() {
	if (!qLineEl) qLineEl = document.getElementById('quote-text')
	if (!qAuthEl) qAuthEl = document.getElementById('quote-author')
	if (!containerEl) containerEl = document.getElementById('quote-container')
	if (!qLineEl || !qAuthEl || !containerEl) return

	const quote = quoteManager.next()
	if (!quote) return

	qLineEl.textContent = `"${quote.text}"`

	const activeTheme = themeManager.getActiveTheme()
	qAuthEl.textContent = activeTheme.useTilde ? `~ ${quote.author}` : quote.author

	containerEl.classList.remove('exit')
	requestAnimationFrame(() => {
		containerEl?.classList.add('active')
	})

	const charCount = quote.text.length
	if (charCount > 300) {
		qLineEl.setAttribute('data-length', 'long')
	} else if (charCount > 150) {
		qLineEl.setAttribute('data-length', 'medium')
	} else {
		qLineEl.setAttribute('data-length', 'short')
	}

	setTimeout(() => (animating = false), 500)
}

document.addEventListener('DOMContentLoaded', () => {
	containerEl = document.getElementById('quote-container')
	qLineEl = document.getElementById('quote-text')
	qAuthEl = document.getElementById('quote-author')

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
		const activeEl = document.activeElement as HTMLElement | null
		const isInteractive =
			activeEl &&
			(activeEl.tagName === 'BUTTON' ||
				activeEl.tagName === 'A' ||
				activeEl.tagName === 'INPUT' ||
				activeEl.tagName === 'TEXTAREA' ||
				activeEl.tagName === 'SELECT' ||
				activeEl.isContentEditable)

		if ((e.code === 'Space' || e.code === 'Enter') && !isInteractive) {
			triggerNextQuote()
		}
		if ((e.code === 'KeyT' || e.key === 't' || e.key === 'T') && !isInteractive) {
			themeManager.nextTheme()
		}
	})

	// Initial check — themeManager.initAll loads the saved theme, then triggers
	// the first quote once the active theme is ready.
	themeManager.initAll(triggerNextQuote)
})
