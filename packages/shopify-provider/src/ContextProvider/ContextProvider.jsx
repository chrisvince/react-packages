import React, { useEffect, useReducer } from 'react'
import { object } from 'prop-types'
import { saveState } from '../store/localStorage'

import { context, reducer, initialState } from '../store'

const { Provider: ContextProvider } = context

const DISPLAY_NAME = 'ContextProvider'

const PROP_TYPES = {
	// eslint-disable-next-line react/forbid-prop-types
	client: object.isRequired,
}

const Component = ({ children, client }) => {
	const initialStateWithClient = {
		...initialState,
		client,
	}
	const [ state, dispatch ] = useReducer(reducer, initialStateWithClient)

	useEffect(() => {
		saveState(state)
	}, [ state ])

	return (
		<ContextProvider value={{ state, dispatch }}>
			{children}
		</ContextProvider>
	)
}

Component.displayName = DISPLAY_NAME
Component.propTypes = PROP_TYPES

export default Component
