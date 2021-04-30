import { assoc } from 'ramda'
import defaultState from './initialState'
import actions from './actions'

const {
	LINE_ITEMS_SET,
	LINE_ITEMS_CLEAR,
	CHECKOUT_ID_SET,
	CHECKOUT_ID_CLEAR,
	LOADING_SET,
} = actions

const reducer = (state, action) => {
	const { payload, type } = action

	switch (type) {
		case LINE_ITEMS_SET: {
			return assoc('lineItems', payload.lineItems, state)
		}

		case LINE_ITEMS_CLEAR: {
			return assoc('lineItems', defaultState.lineItems, state)
		}

		case CHECKOUT_ID_SET: {
			return assoc('checkoutId', payload.checkoutId, state)
		}

		case CHECKOUT_ID_CLEAR: {
			return assoc('checkoutId', defaultState.checkoutId, state)
		}

		case LOADING_SET: {
			return assoc('loading', payload.loading, state)
		}

		default: {
			return state
		}
	}
}

export default reducer
