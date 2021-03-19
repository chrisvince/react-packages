import numeral from 'numeral'

export default (price = {}, options = {}) => {
	if (!price) {
		return undefined
	}
	const {
		amount,
		currencyCode,
	} = price
	const {
		format = '$0,0.00',
		showCurrency = true,
	} = options

	const formattedCurrencyCode = (currencyCode && showCurrency) ? `${currencyCode} ` : ''
	const formattedAmount = numeral(amount).format(format)

	return `${formattedCurrencyCode}${formattedAmount}`
}
