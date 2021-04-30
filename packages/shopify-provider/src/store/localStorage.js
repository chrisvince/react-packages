import initialize from '@sb-m/state-local-storage'

const { loadState, saveState } = initialize({
	localStorageKey: 'shopify-state',
	select: [
		'checkoutId',
		'lineItems',
	],
})

export {
	loadState,
	saveState,
}
