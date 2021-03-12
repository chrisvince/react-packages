import formatPrice from './formatPrice'

export default priceRange => {
	const { maxVariantPrice, minVariantPrice } = priceRange
	const amountsMatch = minVariantPrice.amount === maxVariantPrice.amount
	const currencyCodesMatch = minVariantPrice.currencyCode === maxVariantPrice.currencyCode
	const minPriceWithCurrency = formatPrice(minVariantPrice.amount, minVariantPrice.currencyCode)
	const maxPriceWithCurrency = formatPrice(maxVariantPrice.amount, maxVariantPrice.currencyCode)
	const maxPrice = formatPrice(maxVariantPrice.amount)
	if (amountsMatch && currencyCodesMatch) {
		return minPriceWithCurrency
	}
	if (currencyCodesMatch) {
		return `${minPriceWithCurrency}-${maxPrice}`
	}
	return `${minPriceWithCurrency}-${maxPriceWithCurrency}`
}
