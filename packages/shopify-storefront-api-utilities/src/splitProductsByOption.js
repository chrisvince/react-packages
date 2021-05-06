import { append, concat, dissoc } from 'ramda'
import { arrayOf, checkPropTypes, shape, string } from 'prop-types'

const DISPLAY_NAME = 'splitProductsByOption'

const PROP_TYPES = {
	optionName: string.isRequired,
	products: arrayOf(shape({
		handle: string.isRequired,
		options: arrayOf(shape({
			name: string.isRequired,
			values: arrayOf(string).isRequired,
		})).isRequired,
		variants: arrayOf(shape({
			selectedOptions: arrayOf(shape({
				name: string.isRequired,
				value: string.isRequired,
			})).isRequired,
		})).isRequired,
	})).isRequired,
	config: {
		productPagePathPrefix: string,
	},
}

export default (optionName, products, config = {}) => {
	checkPropTypes(PROP_TYPES.optionName, optionName, 'optionName', DISPLAY_NAME)
	checkPropTypes(PROP_TYPES.products, products, 'products', DISPLAY_NAME)
	checkPropTypes(PROP_TYPES.config, config, 'config', DISPLAY_NAME)

	const { productPagePathPrefix = '/shop' } = config

	const productsWithOptions = products.reduce((accumulator, product) => {
		const { handle, variants, options } = product
		const productWithoutVariants = dissoc('variants', product)
		const matchingOptions = options.find(({ name }) => name === optionName)

		if (!matchingOptions) {
			const to = `${productPagePathPrefix}/${handle}`
			const newOption = {
				optionValue: undefined,
				product: productWithoutVariants,
				to,
				variants,
			}
			return append(newOption, accumulator)
		}

		const newOptions = matchingOptions.values.map(optionValue => {
			const matchingVariants = variants.filter(variant => {
				const { selectedOptions } = variant
				const currentOption = selectedOptions.find(({ name }) => name === optionName)
				if (!currentOption) {
					return false
				}
				return currentOption.value === optionValue
			})
			const parameters = new URLSearchParams({ [optionName]: optionValue }).toString()
			const to = `${productPagePathPrefix}/${handle}?${parameters}`
			return {
				optionValue,
				product: productWithoutVariants,
				to,
				variants: matchingVariants,
			}
		})
		return concat(accumulator, newOptions)
	}, [])

	return productsWithOptions
}
