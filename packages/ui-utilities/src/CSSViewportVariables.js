import React, { useEffect, useRef, useState } from 'react'
import { animated, useSpring, to } from 'react-spring'

const initializeState = key => {
	if (typeof window === 'undefined') return undefined
	return `${window[key]}px`
}

const createCSSVariable = (key, value) => (key && value)  ? `--${key}:${value};` : ''

const CSSViewportVariables = () => {
	const [ innerWidthState, setInnerWidthState ] = useState(initializeState('innerWidth'))
	const [ innerHeightState, setInnerHeightState ] = useState(initializeState('innerHeight'))
	const initialInnerWidth = useRef(initializeState('innerWidth')).current
	const initialInnerHeight = useRef(initializeState('innerHeight')).current

	useEffect(() => {
		const handleWindowResize = () => {
			const { innerHeight, innerWidth } = window
			setInnerHeightState(`${innerHeight}px`)
			setInnerWidthState(`${innerWidth}px`)
		}
		handleWindowResize()
		window.addEventListener('resize', handleWindowResize)
		return () => window.removeEventListener('resize', handleWindowResize)
	}, [])

	const animation = useSpring({ innerHeight: innerHeightState, innerWidth: innerWidthState })

	return (
		<animated.style>
			{to([ animation.innerWidth, animation.innerHeight], (innerWidth, innerHeight) => (
				`:root {${createCSSVariable('inner-width', innerWidth)}${createCSSVariable('inner-height', innerHeight)}${createCSSVariable('initial-inner-width', initialInnerWidth)}${createCSSVariable('initial-inner-height', initialInnerHeight)}`
			))}
		</animated.style>
	)
}

export default CSSViewportVariables
