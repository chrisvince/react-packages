import { assoc, pipe } from 'ramda'
import defaultState from './defaultState'

const reducer = (state, action) => {
	const { payload, type } = action

	switch (type) {
		case 'OVERLAY_SET_SHOW': {
			return pipe(
				x => assoc('show', payload.show, x),
				x => payload.content ? assoc('content', payload.content, x) : x,
				x => payload.component ? assoc('component', payload.component, x) : x,
				x => payload.props ? assoc('props', payload.props, x) : x,
				x => payload.zIndex ? assoc('zIndex', payload.zIndex, x) : x,
				x => {
					const isSet = payload.closeOnBackdropClick !== undefined
					const setValue = payload.closeOnBackdropClick
					const defaultValue = defaultState.closeOnBackdropClick
					return assoc('closeOnBackdropClick', isSet ? setValue : defaultValue, x)
				},
			)(state)
		}

		case 'OVERLAY_CLEAR': {
			return pipe(
				x => assoc('show', false, x),
				x => assoc('content', defaultState.content, x),
				x => assoc('zIndex', defaultState.zIndex, x),
				x => assoc('component', defaultState.component, x),
				x => assoc('props', defaultState.props, x),
				x => assoc('closeOnBackdropClick', defaultState.closeOnBackdropClick, x),
			)(state)
		}

		default: {
			return state
		}
	}
}

export default reducer
