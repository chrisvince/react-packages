import React, { useReducer } from 'react'
import { context, reducer, defaultState } from '../store'

const { Provider: ContextProvider } = context

const DISPLAY_NAME = 'ContextProvider'

const Component = ({ children }) => {
	const [ state, dispatch ] = useReducer(reducer, defaultState)
	const value = { state, dispatch }

	return (
		<ContextProvider value={value}>
			{children}
		</ContextProvider>
	)
}

Component.displayName = DISPLAY_NAME

export default Component
