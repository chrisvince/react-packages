import { useCallback } from 'react'
import { checkPropTypes, shape, string } from 'prop-types'
import { useLocation } from '@reach/router'

const DISPLAY_NAME = 'useProductAnalytics'

const VIEW_PRODUCT_EVENT = 'view-product'
const PRODUCT_CUSTOMIZED_EVENT = 'customize-product'
const PRODUCT_ADDED_TO_BAG_EVENT = 'add-to-bag'

const PROP_TYPES = {
	decodedShopifyId: string.isRequired,
	title: string.isRequired,
	variant: shape({
		compareAtPriceV2: shape({
			amount: string.isRequired,
			currencyCode: string.isRequired,
		}),
		decodedShopifyId: string.isRequired,
		image: shape({
			originalSrc: string.isRequired,
		}).isRequired,
		linkTo: string.isRequired,
		priceV2: shape({
			amount: string.isRequired,
			currencyCode: string.isRequired,
		}).isRequired,
	}),
}

const usePDPAnalytics = product => {
	checkPropTypes(PROP_TYPES, product, 'prop', DISPLAY_NAME)
	const location = useLocation()

	const {
		decodedShopifyId: productId,
		title,
		variant: {
			compareAtPriceV2: {
				amount: productCompareAtPrice,
				currencyCode: productCompareAtPriceCurrencyCode,
			} = {},
			decodedShopifyId: productVariantId,
			image: {
				originalSrc: productVariantImage,
			} = {},
			linkTo,
			priceV2: {
				amount: productPriceAmount,
				currencyCode: productPriceCurrencyCode,
			} = {},
		},
	} = product

	const productVariantUrl = location.origin + linkTo

	const data = {
		productCompareAtPrice,
		productCompareAtPriceCurrencyCode,
		productId,
		productPriceAmount: parseFloat(productPriceAmount),
		productPriceCurrencyCode,
		productTitle: title,
		productVariantId,
		productVariantImage,
		productVariantUrl,
	}

	const createEventLogger = useCallback(event => () => {
		if (!Array.isArray(window.dataLayer)) {
			window.dataLayer = []
		}
		window.dataLayer.push({ event, ...data })
	}, [ data ])

	return {
		productAddedToBag: createEventLogger(PRODUCT_ADDED_TO_BAG_EVENT),
		productViewed: createEventLogger(VIEW_PRODUCT_EVENT),
		productCustomized: createEventLogger(PRODUCT_CUSTOMIZED_EVENT),
	}
}

export default usePDPAnalytics
