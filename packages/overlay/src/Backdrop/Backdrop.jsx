import React, { useCallback } from 'react'
import styled from 'styled-components'

const DISPLAY_NAME = 'Backdrop'

const Wrapper = styled.div`
	width: 100%;
	min-height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
`

const DEFAULT_PROPS = {}

const PROP_TYPES = {
	onClick: () => {},
}

const Component = props => {
	const {
		children,
		className,
		style,
		onClick,
	} = props

	const handleBackdropClick = useCallback(event => {
		if (event.target !== event.currentTarget) return
		onClick(event)
	}, [ onClick ])

	return (
		<Wrapper
			onClick={handleBackdropClick}
			className={className}
			style={style}
		>
			{children}
		</Wrapper>
	)
}

Component.defaultProps = DEFAULT_PROPS
Component.displayName = DISPLAY_NAME
Component.propTypes = PROP_TYPES

export default Component
