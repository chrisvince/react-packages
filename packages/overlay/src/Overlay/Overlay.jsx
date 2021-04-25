import React, { useCallback, useEffect, useRef } from 'react'
import { number, string } from 'prop-types'
import styled from 'styled-components'
import { position } from 'polished'
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'

import createRequestCloseEvent from '../utilities/createRequestCloseEvent'
import { useOverlayContext } from '../store'

const DISPLAY_NAME = 'RenderOverlay'

const OverlayWrapper = styled.div`
	position: fixed;
	${position(0)}
	z-index: 8500;
	overflow: auto;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
`

const DEFAULT_PROPS = {
	zIndex: undefined,
}

const PROP_TYPES = {
	component: string.isRequired,
	zIndex: number,
}

const Component = props => {
	const {
		children,
		component,
		zIndex,
	} = props

	const overlayRef = useRef()
	const { state } = useOverlayContext()
	const { overlays } = state

	useEffect(() => {
		const overlayRefCurrent = overlayRef.current
		disableBodyScroll(overlayRefCurrent)
		return () => enableBodyScroll(overlayRefCurrent)
	}, [])

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

	const handleBackdropClick = useCallback(event => {
		if (event.target !== event.currentTarget) return
		const closeEvent = createRequestCloseEvent(component)
		window.dispatchEvent(closeEvent)
	}, [ component ])

	return (
		<OverlayWrapper
			style={{ zIndex }}
			ref={overlayRef}
			onClick={handleBackdropClick}
		>
			{children}
		</OverlayWrapper>
	)
}

Component.defaultProps = DEFAULT_PROPS
Component.displayName = DISPLAY_NAME
Component.propTypes = PROP_TYPES

export default Component
