import { useCallback, useMemo } from 'react'
import { append, assoc, prop } from 'ramda'
import {
	add,
	decrement,
	increment,
	remove,
	setQuantity,
} from '@nmsp/line-items'

import { actions, useContext } from './store'
import useValidateCheckout from './useValidateCheckout'

const { LINE_ITEMS_SET } = actions

const useLineItems = ({ variantData } = {}) => {
	const { state, dispatch } = useContext()

	const setLineItems = useCallback(lineItems => dispatch({
		type: LINE_ITEMS_SET,
		payload: { lineItems },
	}), [ dispatch ])

	const handleAdd = useCallback(({ variantId, quantity }) => {
		setLineItems(add(variantId, quantity, state.lineItems))
	}, [ setLineItems, state.lineItems ])

	const handleDecrement = useCallback(({ variantId }) => {
		setLineItems(decrement(variantId, state.lineItems))
	}, [ setLineItems, state.lineItems ])

	const handleIncrement = useCallback(({ variantId }) => {
		setLineItems(increment(variantId, state.lineItems))
	}, [ setLineItems, state.lineItems ])

	const handleRemove = useCallback(({ variantId }) => {
		setLineItems(remove(variantId, state.lineItems))
	}, [ setLineItems, state.lineItems ])

	const handleSetQuantity = useCallback(({ variantId, quantity }) => {
		setLineItems(setQuantity(variantId, quantity, state.lineItems))
	}, [ setLineItems, state.lineItems ])

	const assocVariantData = useCallback((lineItems, variants) => (
		lineItems.reduce((acc, lineItem) => {
			const matchingVariant = (
				variants.find(variant => variant.shopifyId === lineItem.variantId)
			)

			if (!matchingVariant) {
				handleRemove({ variantId: prop('variantId', lineItem) })
				return acc
			}

			const newLineItem = assoc('variant', matchingVariant, lineItem)
			return append(newLineItem, acc)
		}, [])
	), [ handleRemove ])

	const lineItems = useMemo(() => {
		if (variantData) {
			return assocVariantData(state.lineItems, variantData)
		}
		return state.lineItems
	}, [ assocVariantData, state.lineItems, variantData ])

	useValidateCheckout()

	return {
		add: handleAdd,
		decrement: handleDecrement,
		increment: handleIncrement,
		remove: handleRemove,
		setQuantity: handleSetQuantity,
		lineItems,
	}
}

export default useLineItems
