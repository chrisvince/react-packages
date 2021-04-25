import React from 'react'
import { object } from 'prop-types'

import ContextProvider from '../ContextProvider'
import ContentAndOverlays from '../ContentAndOverlays'

const DISPLAY_NAME = 'Provider'

const PROP_TYPES = {
	// eslint-disable-next-line react/forbid-prop-types
	components: object.isRequired,
}

const Component = ({ children, components }) => (
	<ContextProvider>
		<ContentAndOverlays components={components}>
			{children}
		</ContentAndOverlays>
	</ContextProvider>
)

Component.displayName = DISPLAY_NAME
Component.propTypes = PROP_TYPES

export default Component
