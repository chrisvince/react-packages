import { assoc, update, nth, dec, remove } from 'ramda'
import { findLineItemIndex } from './utilities'

export default (variantId, lineItems) => {
	const existingLineItemIndex = findLineItemIndex(variantId, lineItems)

	if (existingLineItemIndex === -1) {
		return lineItems
	}

	const lineItemToChange = nth(existingLineItemIndex, lineItems)
	const newQuantity = dec(lineItemToChange.quantity)

	if (newQuantity <= 0) {
		const newLineItems = remove(existingLineItemIndex, 1, lineItems)
		return newLineItems
	}

	const newLineItem = assoc('quantity', newQuantity, lineItemToChange)
	const newLineItems = update(existingLineItemIndex, newLineItem, lineItems)
	return newLineItems
}
