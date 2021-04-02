import React from 'react'
import { object } from 'prop-types'

import ContextProvider from '../ContextProvider'
import RenderOverlay from '../RenderOverlay'

const DISPLAY_NAME = 'Provider'

const PROP_TYPES = {
	components: object.isRequired,
}

const Component = ({ children, components }) => (
	<ContextProvider>
		<RenderOverlay components={components}>
			{children}
		</RenderOverlay>
	</ContextProvider>
)

Component.displayName = DISPLAY_NAME
Component.propTypes = PROP_TYPES

export default Component
