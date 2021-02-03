import { assoc, inc, update, nth } from 'ramda'
import findLineItemIndex from './utilities/findLineItemIndex'

export default (variantId, lineItems) => {
	const existingLineItemIndex = findLineItemIndex(variantId, lineItems)

	if (existingLineItemIndex === -1) {
		return lineItems
	}

	const lineItemToChange = nth(existingLineItemIndex, lineItems)
	const newQuantity = inc(lineItemToChange.quantity)
	const newLineItem = assoc('quantity', newQuantity, lineItemToChange)
	const newLineItems = update(existingLineItemIndex, newLineItem, lineItems)
	return newLineItems
}