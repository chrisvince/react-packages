import { useCallback } from 'react'
import { checkPropTypes, number, object, string } from 'prop-types'
import { useOverlayContext } from './store'
import useMountOverlay from './useMountOverlay'
import createRequestCloseEvent from './utilities/createRequestCloseEvent'

const DISPLAY_NAME = 'useOverlay'

const PROP_TYPES = {
	component: string,
	props: object,
	zIndex: number,
}

const useShowOverlay = (options = {}) => {
	checkPropTypes(PROP_TYPES, options, 'option', DISPLAY_NAME)

	const {
		component,
		props,
		zIndex,
	} = options

	const { state: { overlays } } = useOverlayContext()
	const { setMounted, isMounted } = useMountOverlay({
		component,
		props,
		zIndex,
	})

	const setShow = useCallback(show => {
		if (show) {
			setMounted(true)
			return
		}
		const closeEvent = createRequestCloseEvent(component)
		window.dispatchEvent(closeEvent)
	}, [ component, setMounted ])

	const hideAll = useCallback(() => {
		if (!overlays) return
		overlays.forEach(overlay => {
			const closeEvent = createRequestCloseEvent(overlay.component)
			window.dispatchEvent(closeEvent)
		})
	}, [ overlays ])

	return {
		isShown: isMounted,
		setShow,
		hideAll,
	}
}

export default useShowOverlay
