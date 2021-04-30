import { useCallback } from 'react'

import { actions, useContext } from './store'
import useValidateCheckout from './useValidateCheckout'

const { LOADING_SET, CHECKOUT_ID_SET } = actions

const useCheckout = () => {
	const { state, dispatch } = useContext()

	const setCheckoutId = useCallback(checkoutId => dispatch({
		type: CHECKOUT_ID_SET,
		payload: { checkoutId },
	}), [ dispatch ])

	const setLoading = useCallback(loading => dispatch({
		type: LOADING_SET,
		payload: { loading },
	}), [ dispatch ])

	const createCheckout = useCallback(() => (
		state.client.checkout.create({ lineItems: state.lineItems })
	), [ state.client, state.lineItems ])

	const updateCheckout = useCallback(checkoutId => (
		state.client.checkout.replaceLineItems(checkoutId, state.lineItems)
	), [ state.client, state.lineItems ])

	const prepare = useCallback(async () => {
		setLoading(true)

		if (!state.lineItems.length) {
			// eslint-disable-next-line no-console
			console.error('No line items exist.')
			return null
		}

		if (!state.checkoutId) {
			const checkout = await createCheckout()
			setCheckoutId(checkout.id)
			return checkout
		}

		const checkout = await updateCheckout(state.checkoutId)
		setCheckoutId(checkout.id)
		return checkout
	}, [
		createCheckout,
		setCheckoutId,
		setLoading,
		state.checkoutId,
		state.lineItems.length,
		updateCheckout,
	])

	useValidateCheckout()

	return {
		prepare,
		id: state.checkoutId,
		loading: state.loading,
		client: state.client,
	}
}

export default useCheckout
