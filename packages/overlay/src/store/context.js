import { createContext } from 'react'
import defaultState from './defaultState'

const DISPLAY_NAME = 'OverlayContext'

const context = createContext({
	state: defaultState,
	dispatch: undefined,
})

context.displayName = DISPLAY_NAME

export default context
