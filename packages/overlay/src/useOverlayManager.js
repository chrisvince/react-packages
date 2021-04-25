import { useCallback, useEffect, useRef } from 'react'
import useOverlay from './useOverlay'

import consts from './consts'
import useMountOverlay from './useMountOverlay'

const { OVERLAY_SHOULD_CLOSE_EVENT_TYPE } = consts

const useOverlayManager = props => {
	const {
		component,
		onCloseRequested: onCloseRequestedProp,
		onMounted = () => {},
	} = props

	const { setMounted } = useMountOverlay({ component })
	const { setShow } = useOverlay({ component })
	const unmount = useCallback(() => setMounted(false), [ setMounted ])
	const unshow = useCallback(() => setShow(false), [ setShow ])
	const onCloseRequested = onCloseRequestedProp || unmount
	const onMountedCalled = useRef(false)

	useEffect(() => {
		const handleOverlayClose = event => {
			const isCurrentComponent = component === event.detail.component
			if (!isCurrentComponent) return
			onCloseRequested(unmount)
		}
		window.addEventListener(OVERLAY_SHOULD_CLOSE_EVENT_TYPE, handleOverlayClose)
		return () => window.removeEventListener(OVERLAY_SHOULD_CLOSE_EVENT_TYPE, handleOverlayClose)
	}, [ component, onCloseRequested, unmount ])

	useEffect(() => {
		if (onMountedCalled.current) {
			return
		}
		onMounted()
		onMountedCalled.current = true
	})

	return {
		unmount,
		unshow,
	}
}

export default useOverlayManager
