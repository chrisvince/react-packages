import { useEffect } from 'react'

const useSetScreenCSSVariables = () => {
	useEffect(() => {
		const handleWindowResize = () => {
			const { innerHeight, innerWidth } = window
			const { documentElement } = document
			documentElement.style.setProperty('--inner-height', `${innerHeight}px`)
			documentElement.style.setProperty('--inner-width', `${innerWidth}px`)
		}

		window.addEventListener('resize', handleWindowResize)
		handleWindowResize()
		return () => window.removeEventListener('resize', handleWindowResize)
	}, [])

	useEffect(() => {
		const { innerHeight, innerWidth } = window
		const { documentElement } = document
		documentElement.style.setProperty('--initial-inner-height', `${innerHeight}px`)
		documentElement.style.setProperty('--initial-inner-width', `${innerWidth}px`)
	}, [])
}

export default useSetScreenCSSVariables
