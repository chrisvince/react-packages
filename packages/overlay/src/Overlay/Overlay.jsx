import React, { useEffect, useMemo, useRef } from 'react'
import { bool, number, string } from 'prop-types'
import styled from 'styled-components'
import { position } from 'polished'
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'

import createRequestCloseEvent from '../utilities/createRequestCloseEvent'
import { useOverlayContext } from '../store'

const DISPLAY_NAME = 'RenderOverlay'

const LOCK_BODY_STATES = [ 'entering', 'entered' ]

const OverlayWrapper = styled.div`
	position: fixed;
	${position(0)}
	z-index: 8500;
	overflow: auto;
`

const DEFAULT_PROPS = {
	zIndex: undefined,
	lockScroll: true,
}

const PROP_TYPES = {
	component: string.isRequired,
	lockScroll: bool,
	zIndex: number,
}

const Component = props => {
	const {
		children,
		component,
		zIndex,
		lockScroll,
	} = props

	const overlayRef = useRef()
	const { state } = useOverlayContext()
	const { overlays } = state

	const overlay = useMemo(() => (
		overlays.find(x => x.component === component)
	), [ component, overlays ])

	useEffect(() => {
		if (!LOCK_BODY_STATES.includes(overlay.state)) return
		const overlayRefCurrent = overlayRef.current
		disableBodyScroll(overlayRefCurrent)
		return () => enableBodyScroll(overlayRefCurrent)
	}, [ lockScroll ])

	useEffect(() => {
		const handleKeydown = event => {
			if (event.keyCode !== 27) return
			const highestOverlay = overlays.reduce((acc, curr) => curr.zIndex > acc.zIndex ? curr : acc)
			if (highestOverlay.component !== component) return
			const closeEvent = createRequestCloseEvent(component)
			window.dispatchEvent(closeEvent)
		}
		window.addEventListener('keydown', handleKeydown)
		return () => window.removeEventListener('keydown', handleKeydown)
	}, [ overlays, component ])

	return (
		<OverlayWrapper
			style={{ zIndex }}
			ref={overlayRef}
		>
			{children}
		</OverlayWrapper>
	)
}

Component.defaultProps = DEFAULT_PROPS
Component.displayName = DISPLAY_NAME
Component.propTypes = PROP_TYPES

export default Component
