import type { Quote } from './types'

class QuoteManager {
	private quotes: Quote[] = []
	private playlist: Quote[] = []
	private currentIndex = 0
	private seenCount = 0

	init(data: Quote[]) {
		if (!data || !Array.isArray(data) || data.length === 0) {
			console.error("QuoteManager: No quote data provided or data is empty.")
			return
		}
		this.quotes = data
		this.generatePlaylist()
	}

	private shuffle<T>(array: T[]): T[] {
		const newArr = [...array]
		for (let i = newArr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1))
			;[newArr[i], newArr[j]] = [newArr[j], newArr[i]]
		}
		return newArr
	}

	private generatePlaylist() {
		const quotesByAuthor: Record<string, Quote[]> = {}
		this.quotes.forEach((q) => {
			if (!quotesByAuthor[q.author]) quotesByAuthor[q.author] = []
			quotesByAuthor[q.author].push(q)
		})

		// Shuffle each author's quotes internally
		for (const author in quotesByAuthor) {
			quotesByAuthor[author] = this.shuffle(quotesByAuthor[author])
		}

		const authors = Object.keys(quotesByAuthor)
		const newPlaylist: Quote[] = []
		let round = 0

		while (authors.some((a) => quotesByAuthor[a].length > round)) {
			let roundAuthors = authors.filter(
				(a) => quotesByAuthor[a].length > round,
			)

			// Shuffle authors for this round
			roundAuthors = this.shuffle(roundAuthors)
			roundAuthors.forEach((a) => {
				newPlaylist.push(quotesByAuthor[a][round])
			})
			round++
		}

		this.playlist = newPlaylist
		// Always start at the top. Randomness comes from the builder itself:
		// each round shuffles its author order, and each author's quote pool
		// is also shuffled — so every load produces a genuinely different sequence.
		this.currentIndex = 0
		this.seenCount = 0
	}

	next(): Quote | null {
		if (this.playlist.length === 0) return null
		const quote = this.playlist[this.currentIndex]

		this.currentIndex = (this.currentIndex + 1) % this.playlist.length
		this.seenCount++

		// When we've seen everything once, reshuffle and start a new randomized cycle
		if (this.seenCount >= this.playlist.length) {
			this.generatePlaylist()
		}

		return quote
	}
}

export const quoteManager = new QuoteManager()
