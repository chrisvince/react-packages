import { assoc } from 'ramda'

export default (queryOptions = {}) => variant => {
	const { product: { options }, selectedOptions } = variant
	const calculatedOptions = options.reduce((accumulator, { name, values }) => {
		const queryOption = queryOptions[name]
		const defaultValue = values[0]
		const queryOptionIsValid = values.includes(queryOption)
		const value = queryOptionIsValid ? queryOption : defaultValue
		return assoc(name, value, accumulator)
	}, {})
	return selectedOptions.every(({ value, name }) => value === calculatedOptions[name])
}
