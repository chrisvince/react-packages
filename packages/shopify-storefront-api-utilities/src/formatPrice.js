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
		showCurrencyCode = true,
		showCurrencySymbol = true,
		showCurrencyCodeAfterPrice = false,
	} = options

	const computedCurrencyCode = (currencyCode && showCurrencyCode) ? currencyCode : ''
	const currencySymbol = (currencyCode && showCurrencySymbol) ? getSymbolFromCurrency(currencyCode) : ''
	const prefix = `${!showCurrencyCodeAfterPrice ? `${computedCurrencyCode} ` : ''}${currencySymbol}`
	const suffix = showCurrencyCodeAfterPrice ? ` ${computedCurrencyCode}` : ''
	const format = `0,0${alwaysShowCents ? '.' : '[.]'}00`
	const formattedAmount = numeral(amount).format(format)
	const formattedPrice = `${prefix}${formattedAmount}${suffix}`
	return formattedPrice
}
