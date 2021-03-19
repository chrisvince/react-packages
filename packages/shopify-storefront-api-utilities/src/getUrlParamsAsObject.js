export default () => {
	if (typeof window === 'undefined') {
		return {}
	}
	const entries = new URLSearchParams(window.location.search).entries()
	return Object.fromEntries(entries)
}
