import { useCallback, useEffect, useMemo } from 'react'
import { useOverlayContext } from './store'
import { checkPropTypes, func, number, object, string } from 'prop-types'

import consts from './consts'
const { OVERLAY_SHOULD_CLOSE_EVENT_TYPE } = consts

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
		onCloseRequested = () => { },
		props,
		zIndex,
	} = options

	const { state: { overlays }, dispatch } = useOverlayContext()

	useEffect(() => {
		const handleOverlayClose = event => {
			const isCurrentComponent = component === event.detail.component
			if (!isCurrentComponent) return
			onCloseRequested()
		}
		window.addEventListener(OVERLAY_SHOULD_CLOSE_EVENT_TYPE, handleOverlayClose)
		return () => window.removeEventListener(OVERLAY_SHOULD_CLOSE_EVENT_TYPE, handleOverlayClose)
	}, [component, onCloseRequested])

	const currentOverlay = useMemo(() => (
		overlays.find(overlay => overlay.component === component)
	), [ component, overlays ])

	useEffect(() => {
		if (overlays.length <= 1) return
		const isDuplicateZIndex = overlays.reduce((acc, curr) => acc.zIndex === curr.zIndex)
		if (!isDuplicateZIndex) return
		// eslint-disable-next-line no-console
		console.error('Multiple zIndex values found in useOverlay. zIndexes should be unique.')
	}, [ overlays ])

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
		if (currentOverlay) {
			return true
		}
		return false
	}, [ currentOverlay ])

	return {
		isMounted,
		setMounted,
		unmountAll,
	}
}

export default useMountOverlay
