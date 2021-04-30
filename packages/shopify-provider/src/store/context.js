import { createContext } from 'react'
import initialState from './initialState'

const DISPLAY_NAME = 'OverlayContext'

const context = createContext(initialState)

context.displayName = DISPLAY_NAME

export default context
