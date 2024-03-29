import { assoc } from 'ramda'

const getUrlParam = optionName => {
	if (typeof window === 'undefined') return null
	return new URLSearchParams(window.location.search).get(optionName)
}

export default options => options.reduce((acc, option) => {
	const matchingUrlParam = getUrlParam(option.name)
	const matchingUrlParamIsOption = matchingUrlParam && option.values.includes(matchingUrlParam)
	const defaultOption = option.values[0]
	const value = matchingUrlParamIsOption ? matchingUrlParam : defaultOption
	return assoc(option.name, value, acc)
}, {})
