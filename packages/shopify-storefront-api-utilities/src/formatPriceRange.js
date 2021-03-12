import formatPrice from './formatPrice'

export default (priceRange, options = {}) => {
	const { maxVariantPrice, minVariantPrice } = priceRange
	const amountsMatch = minVariantPrice.amount === maxVariantPrice.amount
	const currencyCodesMatch = minVariantPrice.currencyCode === maxVariantPrice.currencyCode
	const minPriceWithCurrency = formatPrice(minVariantPrice, options)
	const maxPriceWithCurrency = formatPrice(maxVariantPrice, options)
	const maxPrice = formatPrice(maxVariantPrice, { ...options, showCurrency: false })
	if (amountsMatch && currencyCodesMatch) {
		return minPriceWithCurrency
	}
	if (currencyCodesMatch) {
		return `${minPriceWithCurrency}-${maxPrice}`
	}
	return `${minPriceWithCurrency}-${maxPriceWithCurrency}`
}
