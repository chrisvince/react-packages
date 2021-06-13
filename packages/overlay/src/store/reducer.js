import { append, assoc, isNil, pipe, remove, update } from 'ramda'
import defaultState from './defaultState'

const reducer = (state, action) => {
	const { payload, type } = action

	switch (type) {
		case 'OVERLAY_SET': {
			const existingIndex = state.overlays.findIndex(overlay => (
				overlay.component === payload.component
			))
			const noExisting = existingIndex === -1
			if (noExisting) {
				const newOverlay = {
					component: payload.component,
					props: payload.props,
					zIndex: payload.zIndex,
					lockScroll: payload.lockScroll,
				}
				const newOverlays = append(newOverlay, state.overlays)
				return assoc('overlays', newOverlays, state)
			}

			const updatedExisting = pipe(
				overlay => !isNil(payload.props) ? assoc('props', payload.props, overlay) : overlay,
				overlay => !isNil(payload.zIndex) ? assoc('zIndex', payload.zIndex, overlay) : overlay,
				overlay => !isNil(payload.lockScroll) ? assoc('lockScroll', payload.lockScroll, overlay) : overlay,
			)(state.overlays[existingIndex])

			const newOverlays = update(existingIndex, updatedExisting, state.overlays)
			return assoc('overlays', newOverlays, state)
		}

		case 'OVERLAY_UNSET': {
			const existingIndex = state.overlays.findIndex(overlay => overlay.component === payload.component)
			const noExisting = existingIndex === -1

			if (noExisting) {
				return state
			}

			const newOverlays = remove(existingIndex, 1, state.overlays)
			return assoc('overlays', newOverlays, state)
		}

		case 'OVERLAY_UNSET_ALL': {
			return assoc('overlays', defaultState.overlays, state)
		}

		default: {
			return state
		}
	}
}

export default reducer
