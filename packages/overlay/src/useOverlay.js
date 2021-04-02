import { useCallback, useContext, useMemo } from 'react'
import { context } from './store'

const useOverlay = (options = {}) => {
	const {
		closeOnBackdropClick,
		zIndex: zIndexOption,
		component: componentProp,
		props,
	} = options
	const { state, dispatch } = useContext(context)
	const { show, component: componentState } = state

	const setShow = useCallback(newShow => {
		if (newShow && !componentProp) {
			// eslint-disable-next-line no-console
			console.error('The `component` option must be set.')
			return
		}

		dispatch({
			type: 'OVERLAY_SET_SHOW',
			payload: {
				show: newShow,
				closeOnBackdropClick,
				zIndex: zIndexOption,
				component: componentProp,
				props,
			},
		})
	}, [ closeOnBackdropClick, componentProp, dispatch, props, zIndexOption ])

	const isShown = useMemo(() => {
		if (componentProp) {
			return (componentProp === componentState) && show
		}
		return show
	}, [ componentProp, componentState, show ])

	return {
		isShown,
		setShow,
	}
}

export default useOverlay
