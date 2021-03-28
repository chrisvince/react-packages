import { append, assoc, update, nth } from 'ramda'
import { findLineItemIndex } from './utilities'

export default (variantId, quantity = 1, lineItems) => {
	const existingLineItemIndex = findLineItemIndex(variantId, lineItems)

	if (existingLineItemIndex === -1) {
		const newLineItem = {
			variantId,
			quantity,
		}
		const newLineItems = append(newLineItem, lineItems)
		return newLineItems
	}

	const existingLineItem = nth(existingLineItemIndex, lineItems)
	const existingLineItemQuantityParsed = parseInt(existingLineItem.quantity, 10)
	const quantityParsed = parseInt(quantity, 10)
	const newQuantity = existingLineItemQuantityParsed + quantityParsed
	const newLineItem = assoc('quantity', newQuantity, existingLineItem)
	const newLineItems = update(existingLineItemIndex, newLineItem, lineItems)
	return newLineItems
}
