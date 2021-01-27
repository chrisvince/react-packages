import { append, assoc, update, nth } from 'ramda'
import findLineItemIndex from './utilities/findLineItemIndex'

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

	const lineItemToChange = nth(existingLineItemIndex, lineItems)
	const lineItemToChangeQuantity = parseInt(lineItemToChange.quantity, 10)
	const lineItemDataQuantity = parseInt(variantId.quantity, 10) || 1
	const newQuantity = lineItemToChangeQuantity + lineItemDataQuantity
	const newLineItem = assoc('quantity', newQuantity, lineItemToChange)
	const newLineItems = update(existingLineItemIndex, newLineItem, lineItems)
	return newLineItems
}
