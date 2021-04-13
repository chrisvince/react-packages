import React, { useEffect, useState } from 'react'
import { animated, useSpring, to } from 'react-spring'

const SetScreenCSSVariables = () => {
	const [ innerHeight, setInnerHeight ] = useState(() => {
		if (typeof window === 'undefined') return undefined
		return `${window.innerHeight}px`
	})
	const [ innerWidth, setInnerWidth ] = useState(() => {
		if (typeof window === 'undefined') return undefined
		return `${window.innerWidth}px`
	})

	useEffect(() => {
		const handleWindowResize = () => {
			setInnerHeight(`${window.innerHeight}px`)
			setInnerWidth(`${window.innerWidth}px`)
		}
		handleWindowResize()
		window.addEventListener('resize', handleWindowResize)
		return () => window.removeEventListener('resize', handleWindowResize)
	}, [])

	const animation = useSpring({ innerHeight, innerWidth })

	return (
		<animated.style>
			{to([ animation.innerHeight, animation.innerWidth ], (height, width) => (`
				:root {
					--inner-height: ${height};
					--inner-width: ${width};
				}
			`))}
		</animated.style>
	)
}

export default SetScreenCSSVariables
