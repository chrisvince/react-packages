const getWebFontStatusFromElement = ({ classList }) => {
	const webfontLoading = classList.contains('wf-loading') ? 'loading' : undefined
	const webfontActive = classList.contains('wf-active') ? 'active' : undefined
	const webfontInactive = classList.contains('wf-inactive') ? 'inactive' : undefined
	return webfontActive || webfontInactive || webfontLoading
}

const webFontStatusObserver = (callback, options = {}) => {
	const { disconnectOnActive = true } = options
	let currentStatus

	const callbackIfNewStatus = status => {
		if (status && (status !== currentStatus)) {
			currentStatus = status
			callback(status)
		}
	}

	const handleMutation = (mutationsList, observer) => mutationsList.forEach(mutation => {
		const { attributeName, target } = mutation
		if (!attributeName === 'class') return
		const status = getWebFontStatusFromElement(target)
		callbackIfNewStatus(status)
		if (disconnectOnActive && status === 'active') observer.disconnect()
	})

	const [ htmlElement ] = document.getElementsByTagName('html')
	const status = getWebFontStatusFromElement(htmlElement)
	callbackIfNewStatus(status)
	if (disconnectOnActive && status === 'active') return

	const observer = new MutationObserver(handleMutation)
	observer.observe(htmlElement, { attributes: true })
}

export default webFontStatusObserver
