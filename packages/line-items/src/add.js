import { append, assoc, nth, update } from 'ramda'
import { findLineItemIndex } from './utilities'

export default (variantId, quantity, lineItems) => {
	const existingLineItemIndex = findLineItemIndex(variantId, lineItems)
	const quantityParsed = parseInt(quantity, 10) || 1

	if (existingLineItemIndex === -1) {
		const newLineItem = {
			variantId,
			quantity: quantityParsed,
		}
		const newLineItems = append(newLineItem, lineItems)
		return newLineItems
	}

	const existingLineItem = nth(existingLineItemIndex, lineItems)
	const existingLineItemQuantityParsed = parseInt(existingLineItem.quantity, 10)
	const newQuantity = existingLineItemQuantityParsed + quantityParsed
	const newLineItem = assoc('quantity', newQuantity, existingLineItem)
	const newLineItems = update(existingLineItemIndex, newLineItem, lineItems)
	return newLineItems
}
