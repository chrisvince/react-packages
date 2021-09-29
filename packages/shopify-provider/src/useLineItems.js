import { useCallback, useMemo } from 'react'
import { append, assoc } from 'ramda'
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
	const {
		state: {
			lineItems: stateLineItems = [],
		} = {},
		dispatch,
	} = useContext()

	const setLineItems = useCallback(lineItems => dispatch({
		type: LINE_ITEMS_SET,
		payload: { lineItems },
	}), [ dispatch ])

	const handleAdd = useCallback(({ variantId, quantity }) => {
		setLineItems(add(variantId, quantity, stateLineItems))
	}, [ setLineItems, stateLineItems ])

	const handleDecrement = useCallback(({ variantId }) => {
		setLineItems(decrement(variantId, stateLineItems))
	}, [ setLineItems, stateLineItems ])

	const handleIncrement = useCallback(({ variantId }) => {
		setLineItems(increment(variantId, stateLineItems))
	}, [ setLineItems, stateLineItems ])

	const handleRemove = useCallback(({ variantId }) => {
		setLineItems(remove(variantId, stateLineItems))
	}, [ setLineItems, stateLineItems ])

	const handleSetQuantity = useCallback(({ variantId, quantity }) => {
		setLineItems(setQuantity(variantId, quantity, stateLineItems))
	}, [ setLineItems, stateLineItems ])

	const assocVariantData = useCallback((lineItems, variantData) => (
		lineItems.reduce((acc, lineItem) => {
			const matchingVariant = (
				variantData.find(variant => (
					variant.storefrontId === lineItem.variantId
					|| variant.shopifyId === lineItem.variantId
					|| variant.id === lineItem.variantId
				))
			)

			if (!matchingVariant) {
				handleRemove({ variantId: lineItem?.variantId })
				return acc
			}

			const newLineItem = assoc('variant', matchingVariant, lineItem)
			return append(newLineItem, acc)
		}, [])
	), [ handleRemove ])

	const lineItems = useMemo(() => {
		if (variantData) {
			return assocVariantData(stateLineItems, variantData)
		}
		return stateLineItems
	}, [ assocVariantData, stateLineItems, variantData ])

	const totalQuantity = useMemo(() => (
		lineItems.reduce((acc, lineItem) => acc + lineItem.quantity, 0)
	), [ lineItems ])

	useValidateCheckout()

	return {
		add: handleAdd,
		decrement: handleDecrement,
		increment: handleIncrement,
		remove: handleRemove,
		setQuantity: handleSetQuantity,
		totalQuantity,
		lineItems,
	}
}

export default useLineItems
