import { remove } from 'ramda'
import { findLineItemIndex } from './utilities'

export default (variantId, lineItems) => {
	const existingLineItemIndex = findLineItemIndex(variantId, lineItems)

	if (existingLineItemIndex === -1) {
		return lineItems
	}

	const newLineItems = remove(existingLineItemIndex, 1, lineItems)
	return newLineItems
}
