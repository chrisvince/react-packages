import { useContext as useContextReact } from 'react'
import context from './context'

const useContext = () => useContextReact(context)

export default useContext
