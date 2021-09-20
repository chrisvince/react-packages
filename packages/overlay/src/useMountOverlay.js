import { useCallback, useMemo } from 'react'
import { checkPropTypes, func, number, object, string } from 'prop-types'
import { useOverlayContext } from './store'

const DISPLAY_NAME = 'useMountOverlay'

const PROP_TYPES = {
	component: string,
	onCloseRequested: func,
	props: object,
	zIndex: number,
}

const useMountOverlay = (options = {}) => {
	checkPropTypes(PROP_TYPES, options, 'option', DISPLAY_NAME)
	const {
		component,
		props,
		zIndex,
	} = options

	const { state: { overlays }, dispatch } = useOverlayContext()

	const dispatchMounted = useCallback(() => {
		if (!component) {
			// eslint-disable-next-line no-console
			console.error('The `component` option must be set.')
			return
		}
		dispatch({
			type: 'OVERLAY_SET',
			payload: {
				component,
				props,
				zIndex,
				status: 'entering',
			},
		})
	}, [ component, dispatch, props, zIndex ])

	const dispatchUnmounted = useCallback(() => {
		if (!component) {
			// eslint-disable-next-line no-console
			console.error('The `component` option must be set.')
			return
		}
		dispatch({
			type: 'OVERLAY_UNSET',
			payload: { component },
		})
	}, [ component, dispatch ])

	const setMounted = useCallback(mounted => {
		if (mounted) {
			dispatchMounted()
			return
		}
		dispatchUnmounted()
	}, [ dispatchMounted, dispatchUnmounted ])

	const unmountAll = useCallback(() => {
		dispatch({ type: 'OVERLAY_UNSET_ALL' })
	}, [ dispatch ])

	const isMounted = useMemo(() => {
		const isInOverlayList = overlays.find(overlay => overlay.component === component)
		return !!isInOverlayList
	}, [ component, overlays ])

	return {
		isMounted,
		setMounted,
		unmountAll,
	}
}

export default useMountOverlay
