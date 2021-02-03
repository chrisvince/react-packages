import { is, uniqBy } from 'ramda'

export default (optionNames, variants) => uniqBy(variant => {
	const optionNamesArray = is(Array, optionNames) ? optionNames : [optionNames]
	const { product, selectedOptions } = variant
	const options = selectedOptions.filter(option => optionNamesArray.includes(option.name))
	return {
		productId: product.shopifyId,
		options,
	}
}, variants)
