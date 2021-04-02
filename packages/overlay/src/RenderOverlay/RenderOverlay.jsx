import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import { object } from 'prop-types'
import styled from 'styled-components'
import { position } from 'polished'
import { animated, useSpring } from 'react-spring'
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'

import { context } from '../store'
import useOverlay from '../useOverlay'

const DISPLAY_NAME = 'RenderOverlay'

const ContentWrapper = styled.div``

const OverlayWrapper = styled(animated.div)`
	position: fixed;
	${position(0)}
	z-index: 8500;
	overflow: auto;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
`

const PROP_TYPES = {
	components: object.isRequired,
}

const Component = ({ children, components }) => {
	const overlayRef = useRef()
	const { state, dispatch } = useContext(context)
	const { setShow, isShown } = useOverlay()

	const {
		closeOnBackdropClick,
		component,
		props,
		zIndex,
	} = state

	const handleOverlaySpringRest = useCallback(() => {
		if (isShown) return
		dispatch({ type: 'OVERLAY_CLEAR' })
	}, [ dispatch, isShown ])

	const animation = useSpring({
		onRest: handleOverlaySpringRest,
		opacity: isShown ? 1 : 0,
	})

	const handleBackdropClick = useCallback(event => {
		const ignore = !closeOnBackdropClick || (event.target !== event.currentTarget)
		if (ignore) return
		setShow(false)
	}, [ closeOnBackdropClick, setShow ])

	useEffect(() => {
		if (!isShown) return undefined
		const handleKeydown = event => {
			if (event.keyCode !== 27) return
			setShow(false)
		}
		window.addEventListener('keydown', handleKeydown)
		return () => window.removeEventListener('keydown', handleKeydown)
	}, [ setShow, isShown ])

	useEffect(() => {
		if (isShown) {
			disableBodyScroll(overlayRef.current)
			return
		}
		enableBodyScroll(overlayRef.current)
	}, [ isShown ])

	const overlayPointerEvents = !isShown ? 'none' : undefined
	const overlayWrapperStyle = {
		...animation,
		pointerEvents: overlayPointerEvents,
		zIndex,
	}

	const ContentComponent = useMemo(() => {
		const componentNode = components[component]
		if (component && !componentNode) {
			// eslint-disable-next-line no-console
			console.error(`The component ${component} could not be found. Make sure it is registered using the \`components\` prop in Provider.`)
		}
		return componentNode
	}, [ components, component ])

	return (
		<>
			<ContentWrapper aria-hidden={isShown}>
				{children}
			</ContentWrapper>
			<OverlayWrapper
				style={overlayWrapperStyle}
				aria-hidden={!isShown}
				ref={overlayRef}
				onClick={handleBackdropClick}
			>
				{/* eslint-disable-next-line react/jsx-props-no-spreading */}
				{ContentComponent && <ContentComponent {...props} />}
			</OverlayWrapper>
		</>
	)
}

Component.displayName = DISPLAY_NAME
Component.propTypes = PROP_TYPES

export default Component
