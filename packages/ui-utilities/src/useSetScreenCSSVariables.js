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
}

export default useSetScreenCSSVariables
