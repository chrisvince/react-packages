import { assoc } from 'ramda'

export default selectedOptions.reduce((accumulator, { name, value }) => (
	assoc(name, value, accumulator)
), {})
