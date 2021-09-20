import { useCallback, useEffect, useRef } from 'react'
import useOverlay from './useOverlay'

import consts from './consts'
import useMountOverlay from './useMountOverlay'
import { useOverlayContext } from './store'

const { OVERLAY_SHOULD_CLOSE_EVENT_TYPE } = consts

const useOverlayManager = props => {
	const {
		component,
		onCloseRequested,
		onMounted = () => {},
		closeOnScroll = false,
		zIndex,
		lockScroll = true,
	} = props

	const { dispatch } = useOverlayContext()
	const { setMounted } = useMountOverlay({ component })
	const { setShow, status } = useOverlay({ component })
	const unmount = useCallback(() => setMounted(false), [ setMounted ])
	const unshow = useCallback(() => setShow(false), [ setShow ])
	const onMountedCalled = useRef(false)

	const dispatchStatus = useCallback(status => dispatch({
		type: 'OVERLAY_SET',
		payload: {
			component,
			status: status,
		},
	}), [ component, dispatch ])

	useEffect(() => {
		const handleOverlayClose = event => {
			const isCurrentComponent = component === event.detail.component
			if (!isCurrentComponent) return
			if (onCloseRequested) {
				dispatchStatus('exiting')
				onCloseRequested(unmount)
				return
			}
			unmount()
		}
		window.addEventListener(OVERLAY_SHOULD_CLOSE_EVENT_TYPE, handleOverlayClose)
		return () => window.removeEventListener(OVERLAY_SHOULD_CLOSE_EVENT_TYPE, handleOverlayClose)
	}, [ component, onCloseRequested, unmount, dispatchStatus ])

	useEffect(() => {
		if (onMountedCalled.current) {
			return
		}
		onMounted()
		onMountedCalled.current = true
	})

	useEffect(() => {
		if (!closeOnScroll) return
		window.addEventListener('wheel', unshow)
		return () => window.removeEventListener('wheel', unshow)
	}, [ closeOnScroll, unshow ])

	useEffect(() => {
		dispatch({
			type: 'OVERLAY_SET',
			payload: {
				component,
				lockScroll,
				zIndex,
			},
		})
	}, [ component, dispatch, lockScroll, zIndex ])

	return {
		status,
		unmount,
		unshow,
	}
}

export default useOverlayManager
