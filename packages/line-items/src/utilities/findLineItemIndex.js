export default (variantId, lineItems) => (
	lineItems.findIndex(lineItem => lineItem.variantId === variantId
))
