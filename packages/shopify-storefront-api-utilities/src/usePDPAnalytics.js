import { useEffect, useRef, useCallback, useMemo } from 'react'
import { checkPropTypes, shape, string } from 'prop-types'
import { useLocation } from '@reach/router'
import { prop } from 'ramda'

const DISPLAY_NAME = 'useAnalytics'

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
	const firstRenderComplete = useRef(false)
	const location = useLocation()

	const {
		decodedShopifyId: productId,
		title,
		variant: {
			compareAtPriceV2,
			decodedShopifyId: productVariantId,
			image,
			linkTo,
			priceV2,
		},
	} = product

	const data = useMemo(() => ({
		productCompareAtPrice: parseFloat(prop('amount', compareAtPriceV2)) || undefined,
		productCompareAtPriceCurrencyCode: prop('currencyCode', compareAtPriceV2),
		productId,
		productPriceAmount: parseFloat(priceV2.amount),
		productPriceCurrencyCode: priceV2.currencyCode,
		productTitle: title,
		productVariantId,
		productVariantImage: image.originalSrc,
		productVariantUrl: location.origin + linkTo,
	}), [
		compareAtPriceV2,
		image.originalSrc,
		linkTo,
		location.origin,
		priceV2.amount,
		priceV2.currencyCode,
		productId,
		productVariantId,
		title,
	])

	const createEventLogger = useCallback(event => () => {
		if (!Array.isArray(window.dataLayer)) {
			window.dataLayer = []
		}
		window.dataLayer.push({ event, ...data })
	}, [ data ])

	const handlePageLoad = useCallback(() => {
		if (typeof window === 'undefined') {
			return
		}
		const logEvent = createEventLogger(VIEW_PRODUCT_EVENT)
		logEvent()
	}, [ createEventLogger ])

	useEffect(() => {
		if (!firstRenderComplete.current) return
		const productCustomized = createEventLogger(PRODUCT_CUSTOMIZED_EVENT)
		productCustomized()
	}, [ createEventLogger, productVariantId ])

	useEffect(() => {
		if (firstRenderComplete.current) return
		handlePageLoad()
		firstRenderComplete.current = true
	}, [ handlePageLoad ])

	return { productAddedToBag: createEventLogger(PRODUCT_ADDED_TO_BAG_EVENT) }
}

export default usePDPAnalytics
