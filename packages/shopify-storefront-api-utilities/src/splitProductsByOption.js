import { dissoc } from 'ramda'

export default (optionName, products, config = {}) => {
	const {
		productPagePathPrefix = '/shop',
	} = config

	const productsWithOptions = products.reduce((accumulator, product) => {
		const { handle, variants, options } = product
		const productWithoutVariants = dissoc('variants', product)
		const matchingOptions = options.find(({ name }) => name === optionName)

		if (!matchingOptions) {
			const to = `${productPagePathPrefix}/${handle}`
			return [
				...accumulator,
				{
					optionValue: undefined,
					product: productWithoutVariants,
					to,
					variants,
				},
			]
		}

		const withOptions = matchingOptions.values.map(optionValue => {
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
		return [
			...accumulator,
			...withOptions,
		]
	}, [])

	return productsWithOptions
}
