import { assoc, update, nth } from 'ramda'
import { findLineItemIndex } from './utilities'

export default (variantId, quantity, lineItems) => {
	const existingLineItemIndex = findLineItemIndex(variantId, lineItems)

	if (existingLineItemIndex === -1) {
		return lineItems
	}

	if (quantity <= 0) {
		const newLineItems = remove(existingLineItemIndex, 1, lineItems)
		return newLineItems
	}

	const existingLineItem = nth(existingLineItemIndex, lineItems)
	const quantityParsed = parseInt(quantity, 10)
	const newLineItem = assoc('quantity', quantityParsed, existingLineItem)
	const newLineItems = update(existingLineItemIndex, newLineItem, lineItems)
	return newLineItems
}
