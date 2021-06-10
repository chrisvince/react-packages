import React, { useEffect, useRef, useState } from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import { stripUnit } from 'polished'
import { animated, to, useSpring } from 'react-spring'
import { number, string } from 'prop-types'
import useMedia from 'use-media'

const DISPLAY_NAME = 'CircleCursor'

const computeTextCursorClipAmount = (defaultCursorSize, textCursorWidth) => (
	`${(stripUnit(defaultCursorSize) - stripUnit(textCursorWidth)) / 2}px`
)

const computeTextCursorTranslateY = (defaultCursorSize, textCursorHeight) => (
	`-${((stripUnit(textCursorHeight) - stripUnit(defaultCursorSize)) / 2)}px`
)

const computeCoordinate = (coordinate, size) => `${coordinate - (stripUnit(size) / 2)}px`

const CLICKABLE_CURSOR_TAG_NAMES = [
	'A',
	'BUTTON',
]

const TEXT_CURSOR_TAG_NAMES_CONTINGENT_ON_TYPE = [
	'INPUT',
]

const TEXT_CURSOR_TAG_NAMES = [
	'TEXTAREA',
]

const TEXT_CURSOR_TYPES = [
	'email',
	'phone',
	'text',
]

const CURSOR_TYPES = {
	CLICKABLE: 'clickable',
	TEXT: 'text',
}

const GlobalStyle = createGlobalStyle`* { cursor: none !important; }`

const Cursor = styled(animated.div)`
	@media (pointer: fine) {
		position: fixed;
		top: -100px;
		left: -100px;
		z-index: 9999;
		border-radius: 50%;
		pointer-events: none;
		transform-origin: center;
		mix-blend-mode: difference;
	}
`

const cursorIdFromPath = path => path.reduce((acc, element) => {
	if (acc) return acc
	const { tagName, type } = element
	const matchesClickable = CLICKABLE_CURSOR_TAG_NAMES.includes(tagName)
	if (matchesClickable) {
		return CURSOR_TYPES.CLICKABLE
	}
	const matchesText = TEXT_CURSOR_TAG_NAMES.includes(tagName)
	const matchesTextContingentType = TEXT_CURSOR_TAG_NAMES_CONTINGENT_ON_TYPE.includes(tagName)
	const matchesType = TEXT_CURSOR_TYPES.includes(type)
	const matchesTextAndType = matchesTextContingentType && matchesType
	if (matchesText || matchesTextAndType) {
		return CURSOR_TYPES.TEXT
	}
	return null
}, null)

const DEFAULT_PROPS = {
	activeScale: 2,
	size: '14px',
	textCursorWidth: '2px',
	textCursorHeight: '26px',
	opacity: 0.85,
	color: '#ffffff',
}

const PROP_TYPES = {
	activeScale: number,
	size: string,
	textCursorWidth: string,
	textCursorHeight: string,
	opacity: number,
	color: string,
}

const Component = props => {
	const {
		activeScale,
		size,
		textCursorWidth,
		textCursorHeight,
		opacity,
		color,
	} = props

	const isFinePointer = useMedia({ pointer: 'fine' })
	const ref = useRef()
	const [ cursorVisible, setCursorVisible ] = useState(false)
	const [ cursorScale, setCursorScale ] = useState(1)
	const [ showTextCursor, setShowTextCursor ] = useState(false)

	const animation = useSpring({
		scale: showTextCursor ? 1 : cursorScale,
		height: showTextCursor ? textCursorHeight : size,
		clipPathX: showTextCursor ? computeTextCursorClipAmount(size, textCursorWidth) : '0px',
		translateY: showTextCursor ? computeTextCursorTranslateY(size, textCursorHeight) : '0px',
	})

	useEffect(() => {
		if (!isFinePointer) return

		const handleMouseMove = event => {
			const { x, y } = event
			ref.current.style.top = computeCoordinate(y, size)
			ref.current.style.left = computeCoordinate(x, size)
		}

		window.addEventListener('mousemove', handleMouseMove)
		return () => window.removeEventListener('mousemove', handleMouseMove)
	}, [ isFinePointer, size ])

	useEffect(() => {
		if (!isFinePointer) return

		const handleDocumentMouseOver = event => {
			const path = event.composedPath()
			const cursorId = cursorIdFromPath(path)
			setShowTextCursor(cursorId === CURSOR_TYPES.TEXT)
			setCursorScale(cursorId === CURSOR_TYPES.CLICKABLE ? activeScale : 1)
			setCursorVisible(true)
		}

		document.addEventListener('mouseover', handleDocumentMouseOver)
		return () => document.removeEventListener('mouseover', handleDocumentMouseOver)
	}, [ activeScale, isFinePointer ])

	useEffect(() => {
		if (!isFinePointer) return

		const handleDocumentMouseOut = event => {
			if (event.toElement || event.relatedTarget) {
				return
			}
			setCursorVisible(false)
		}

		document.addEventListener('mouseout', handleDocumentMouseOut)
		return () => document.removeEventListener('mouseout', handleDocumentMouseOut)
	}, [ isFinePointer ])

	useEffect(() => {
		if (!isFinePointer) return

		const handleMouseDown = () => setCursorScale(cursorScale + activeScale)
		const handleMouseUp = () => setCursorScale(1)
		window.addEventListener('mousedown', handleMouseDown)
		window.addEventListener('mouseup', handleMouseUp)

		return () => {
			window.removeEventListener('mousedown', handleMouseDown)
			window.removeEventListener('mouseup', handleMouseUp)
		}
	}, [ activeScale, cursorScale, isFinePointer ])

	return (
		<>
			<GlobalStyle />
			<Cursor
				ref={ref}
				style={{
					opacity: cursorVisible ? opacity : 0,
					transform: to(
						[ animation.scale, animation.translateY ],
						(scale, translateY) => (
							`scale(${scale}) translateY(${translateY})`
						),
					),
					height: animation.height,
					clipPath: animation.clipPathX.to(x => `inset(0 ${x})`),
					width: size,
					backgroundColor: color,
				}}
			/>
		</>
	)
}

Component.defaultProps = DEFAULT_PROPS
Component.displayName = DISPLAY_NAME
Component.propTypes = PROP_TYPES

export default Component
