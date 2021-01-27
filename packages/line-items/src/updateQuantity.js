import { assoc, update, nth } from 'ramda'
import findLineItemIndex from './utilities/findLineItemIndex'

export default (variantId, newQuantity, lineItems) => {
	const existingLineItemIndex = findLineItemIndex(variantId, lineItems)

	if (existingLineItemIndex === -1) {
		return lineItems
	}

	if (!newQuantity) {
		return lineItems
	}

	const lineItemToChange = nth(existingLineItemIndex, lineItems)
	const newQuantityParsed = parseInt(newQuantity, 10)
	const newLineItem = assoc('quantity', newQuantityParsed, lineItemToChange)
	const newLineItems = update(existingLineItemIndex, newLineItem, lineItems)
	return newLineItems
}
