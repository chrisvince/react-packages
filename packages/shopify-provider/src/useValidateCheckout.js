import { useCallback, useEffect } from 'react'

import { actions, useContext } from './store'

const {
	LINE_ITEMS_CLEAR,
	LOADING_SET,
	CHECKOUT_ID_CLEAR,
} = actions

const useValidateCheckout = () => {
	const { state, dispatch } = useContext()

	const setLoading = useCallback(loading => dispatch({
		type: LOADING_SET,
		payload: { loading },
	}), [ dispatch ])

	const fetchCheckout = useCallback(checkoutId => (
		state.client.checkout.fetch(checkoutId)
	), [ state.client ])

	const clearCheckoutId = useCallback(() => dispatch({
		type: CHECKOUT_ID_CLEAR,
	}), [ dispatch ])

	const clearLineItems = useCallback(() => dispatch({
		type: LINE_ITEMS_CLEAR,
	}), [ dispatch ])

	const validateCheckout = useCallback(async () => {
		if (!state.checkoutId) {
			setLoading(false)
			return
		}

		setLoading(true)

		try {
			const existingCheckout = await fetchCheckout(state.checkoutId)
			if (!existingCheckout) {
				clearCheckoutId()
				setLoading(false)
				return
			}
			if (existingCheckout.completedAt) {
				clearLineItems()
				clearCheckoutId()
			}
			setLoading(false)
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error(error)
		}
	}, [ clearCheckoutId, clearLineItems, fetchCheckout, setLoading, state.checkoutId ])

	useEffect(() => {
		validateCheckout()
	}, [ validateCheckout ])
}

export default useValidateCheckout
