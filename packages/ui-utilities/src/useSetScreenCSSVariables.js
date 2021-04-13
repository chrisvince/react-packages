import { useEffect } from 'react'

const useSetScreenCSSVariables = () => {
	useEffect(() => {
		const { innerHeight, innerWidth } = window
		const { documentElement } = document

		documentElement.style.setProperty('--initial-inner-height', `${innerHeight}px`)
		documentElement.style.setProperty('--initial-inner-width', `${innerWidth}px`)

		const handleWindowResize = () => {
			documentElement.style.setProperty('--inner-height', `${innerHeight}px`)
			documentElement.style.setProperty('--inner-width', `${innerWidth}px`)
		}

		window.addEventListener('resize', handleWindowResize)
		handleWindowResize()
		return () => window.removeEventListener('resize', handleWindowResize)
	}, [])
}

export default useSetScreenCSSVariables
