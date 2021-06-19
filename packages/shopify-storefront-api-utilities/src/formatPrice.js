import numeral from 'numeral'
import getSymbolFromCurrency from 'currency-symbol-map'

export default (price = {}, options = {}) => {
	if (!price) {
		return undefined
	}

	const {
		amount,
		currencyCode,
	} = price

	const {
		alwaysShowCents = false,
		showCurrency = true,
	} = options

	const computedCurrency = (currencyCode && showCurrency) ? `${currencyCode} ` : ''
	const currencySymbol = getSymbolFromCurrency(currencyCode)
	const format = `${computedCurrency}${currencySymbol}0,0${alwaysShowCents ? '.' : '[.]'}00`
	const formattedPrice = numeral(amount).format(format)
	return formattedPrice
}
