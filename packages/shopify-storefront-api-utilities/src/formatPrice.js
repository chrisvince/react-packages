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
	const prefix = `${computedCurrency}${currencySymbol}`
	const format = `0,0${alwaysShowCents ? '.' : '[.]'}00`
	const formattedAmount = numeral(amount).format(format)
	const formattedPrice = `${prefix}${formattedAmount}`
	return formattedPrice
}
