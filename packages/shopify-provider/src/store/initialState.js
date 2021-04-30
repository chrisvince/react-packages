import { loadState } from './localStorage'

const defaultState = {
	lineItems: [],
	loading: true,
	checkoutId: undefined,
	client: undefined,
}

const initialState = loadState(defaultState)

export default initialState
