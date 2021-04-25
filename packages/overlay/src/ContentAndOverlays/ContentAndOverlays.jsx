import React from 'react'
import { object } from 'prop-types'

import { useOverlayContext } from '../store'
import Overlay from '../Overlay'

const DISPLAY_NAME = 'ContentAndOverlays'

const DEFAULT_PROPS = {}

const PROP_TYPES = {
	// eslint-disable-next-line react/forbid-prop-types
	components: object.isRequired,
}

const Component = ({ components, children }) => {
	const { state } = useOverlayContext()
	const { overlays } = state
	const overlayExists = !!overlays.length

	return (
		<>
			<div aria-hidden={overlayExists}>
				{children}
			</div>
			{overlays.map(({ component, zIndex, props }) => {
				const OverlayComponent = components[component]
				return (
					<Overlay
						component={component}
						key={component}
						zIndex={zIndex}
					>
						{/* eslint-disable-next-line react/jsx-props-no-spreading */}
						<OverlayComponent {...props} />
					</Overlay>
				)
			})}
		</>
	)
}

Component.defaultProps = DEFAULT_PROPS
Component.displayName = DISPLAY_NAME
Component.propTypes = PROP_TYPES

export default Component
