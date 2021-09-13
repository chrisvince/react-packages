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

	const computedCurrencyCode = (currencyCode && showCurrency) ? `${currencyCode} ` : ''
	const currencySymbol = (currencyCode && showCurrency) ? getSymbolFromCurrency(currencyCode) : ''
	const prefix = `${computedCurrencyCode}${currencySymbol}`
	const format = `0,0${alwaysShowCents ? '.' : '[.]'}00`
	const formattedAmount = numeral(amount).format(format)
	const formattedPrice = `${prefix}${formattedAmount}`
	return formattedPrice
}
