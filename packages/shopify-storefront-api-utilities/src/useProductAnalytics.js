import { checkPropTypes, number, oneOfType, string } from 'prop-types'

const DISPLAY_NAME = 'useProductAnalytics'

const VIEW_PRODUCT_EVENT = 'view-product'
const PRODUCT_CUSTOMIZED_EVENT = 'customize-product'
const PRODUCT_ADDED_TO_BAG_EVENT = 'add-to-bag'

const PROP_TYPES = {
	productCompareAtPriceAmount: oneOfType([ string, number ]),
	productCompareAtPriceCurrencyCode: string,
	productId: string.isRequired,
	productPriceAmount: oneOfType([ string, number ]).isRequired,
	productPriceCurrencyCode: string.isRequired,
	productTitle: string.isRequired,
	productVariantId: string.isRequired,
	productVariantImage: string.isRequired,
	productVariantUrl: string.isRequired,
}

const parseAmount = amount => {
	const float = parseFloat(amount)
	return isNaN(float) ? undefined : float
}

const usePDPAnalytics = props => {
	checkPropTypes(PROP_TYPES, props, 'prop', DISPLAY_NAME)

	const data = {
		productCompareAtPriceAmount: parseAmount(props.productCompareAtPriceAmount),
		productCompareAtPriceCurrencyCode: props.productCompareAtPriceCurrencyCode,
		productId: props.productId,
		productPriceAmount: parseAmount(props.productPriceAmount),
		productPriceCurrencyCode: props.productPriceCurrencyCode,
		productTitle: props.productTitle,
		productVariantId: props.productVariantId,
		productVariantImage: props.productVariantImage,
		productVariantUrl: props.productVariantUrl,
	}

	const createEventLogger = event => () => {
		if (!Array.isArray(window.dataLayer)) {
			window.dataLayer = []
		}
		window.dataLayer.push({ event, ...data })
	}

	return {
		productAddedToBag: createEventLogger(PRODUCT_ADDED_TO_BAG_EVENT),
		productViewed: createEventLogger(VIEW_PRODUCT_EVENT),
		productCustomized: createEventLogger(PRODUCT_CUSTOMIZED_EVENT),
	}
}

export default usePDPAnalytics
