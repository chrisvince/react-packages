import { useCallback } from 'react'
import { checkPropTypes, func, number, object, string } from 'prop-types'
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

	const closeEvent = createRequestCloseEvent(component)
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
		window.dispatchEvent(closeEvent)
	}, [ setMounted ])

	return {
		isShown: isMounted,
		setShow,
	}
}

export default useShowOverlay
