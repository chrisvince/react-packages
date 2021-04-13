import React, { useEffect, useState } from 'react'
import { animated, useSpring, to } from 'react-spring'

const initializeState = key => () => {
	if (typeof window === 'undefined') return undefined
	return `${window[key]}px`
}

const SetScreenCSSVariables = () => {
	const [ innerHeightState, setInnerHeightState ] = useState(initializeState('innerHeight'))
	const [ innerWidthState, setInnerWidthState ] = useState(initializeState('innerWidth'))

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

	useEffect(() => {
		const { innerHeight, innerWidth } = window
		const { documentElement } = document
		documentElement.style.setProperty('--initial-inner-height', `${innerHeight}px`)
		documentElement.style.setProperty('--initial-inner-width', `${innerWidth}px`)
	}, [])

	const animation = useSpring({ innerHeight: innerHeightState, innerWidth: innerWidthState })

	return (
		<animated.style>
			{to([ animation.innerHeight, animation.innerWidth ], (innerHeight, innerWidth) => (
				`:root {--inner-height:${innerHeight};--inner-width:${innerWidth};}`
			))}
		</animated.style>
	)
}

export default SetScreenCSSVariables
