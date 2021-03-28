import { useMemo } from 'react'
import { assoc, dissoc, is, mergeWithKey, omit, pipe, path } from 'ramda'
import { decode } from 'shopify-gid'
import { arrayOf, checkPropTypes, number, object, shape, string } from 'prop-types'
import formatPriceRange from './formatPriceRange'
import selectedOptionsToObject from './selectedOptionsToObject'

const DISPLAY_NAME = 'useShopifyData'

const PRODUCT_DATA_PREFERENCE = {
	title: 'sanity',
	shopifyId: 'shopify',
}

const PRODUCT_VARIANT_DATA_PREFERENCE = {
	shopifyId: 'shopify',
}

const handleDuplicateVariantDataPoint = (key, shopify, sanity) => {
	const preference = PRODUCT_VARIANT_DATA_PREFERENCE[key]
	return preference === 'shopify' ? shopify : sanity
}

const mergeVariants = (shopifyVariants, sanityVariants) => shopifyVariants.map(shopifyVariant => {
	const decodedShopifyId = decode(shopifyVariant.shopifyId).id
	const sanityVariant = sanityVariants.find(x => x.shopifyId.toString() === decodedShopifyId)
	if (!sanityVariant) {
		// eslint-disable-next-line no-console
		console.error(`No sanityVariant found for Shopify ID: ${decodedShopifyId}`)
	}
	return mergeWithKey(handleDuplicateVariantDataPoint, shopifyVariant, sanityVariant)
})

const handleDuplicateProductDataPoint = (key, shopify, sanity) => {
	if (key === 'variants') {
		const mergedVariants = mergeVariants(shopify, sanity)
		return mergedVariants
	}
	const preference = PRODUCT_DATA_PREFERENCE[key]
	return preference === 'shopify' ? shopify : sanity
}

const mergeProducts = (shopifyProducts, sanityProducts) => shopifyProducts.map(shopifyProduct => {
	const decodedShopifyId = decode(shopifyProduct.shopifyId).id
	const sanityProduct = sanityProducts.find(x => x.shopifyId.toString() === decodedShopifyId)
	if (!sanityProduct) {
		// eslint-disable-next-line no-console
		console.error(`No sanityVariant found for Shopify ID: ${decodedShopifyId}`)
	}
	const newMergedProducts = mergeWithKey(
		handleDuplicateProductDataPoint,
		shopifyProduct,
		sanityProduct,
	)
	return newMergedProducts
})

const getVariantsWithNestedProductFromProduct = product => product.variants.map(variant => {
	const productWithoutVariants = dissoc('variants', product)
	return assoc('product', productWithoutVariants, variant)
})

const renderOptionQueryString = selectedOptions => (
	selectedOptions.map(({ name, value }) => `${name}=${value}`).join('&')
)

const PROP_TYPES = {
	allShopifyProduct: shape({
		nodes: arrayOf(shape({
			shopifyId: string.isRequired,
		})).isRequired,
	}).isRequired,
	allSanityProduct: shape({
		nodes: arrayOf(shape({
			shopifyId: number.isRequired,
		})).isRequired,
	}),
	liveShopifyData: shape({
		productByHandle: object,
	}),
}

const useShopifyData = props => {
	checkPropTypes(PROP_TYPES, props, 'prop', DISPLAY_NAME)

	const {
		allShopifyProduct,
		allSanityProduct = {},
		liveShopifyData = {},
		filter,
		find,
		findVariant,
		sort,
		options: {
			renderProductLinkTo = handle => `/shop/${handle}`,
			renderProductVariantLinkTo = (handle, selectedOptions) => (
				`/shop/${handle}?${renderOptionQueryString(selectedOptions)}`
			),
		} = {},
	} = props

	const { nodes: shopifyProducts } = allShopifyProduct
	const { nodes: sanityProducts } = allSanityProduct
	const liveShopifyProduct = liveShopifyData.productByHandle

	const mergedProducts = useMemo(() => {
		if (!sanityProducts) {
			return shopifyProducts
		}
		return mergeProducts(shopifyProducts, sanityProducts)
	}, [ sanityProducts, shopifyProducts ])

	const manipulatedProducts = useMemo(() => mergedProducts.map(shopifyProduct => {
		const manipulateProductVariants = variants => variants.map(pipe(
			variant => (
				(shopifyProduct.handle && variant.selectedOptions) ? (
					assoc(
						'linkTo',
						renderProductVariantLinkTo(shopifyProduct.handle, variant.selectedOptions),
						variant,
					)
				) : variant
			),
			variant => (
				variant.shopifyId ? (
					assoc('decodedShopifyId', decode(variant.shopifyId).id, variant)
				) : variant
			),
			variant => (
				variant.selectedOptions ? (
					assoc(
						'selectedOptionsMap',
						selectedOptionsToObject(variant.selectedOptions),
						variant,
					)
				) : variant
			),
		))

		const manipulateProducts = pipe(
			x => (
				shopifyProduct.handle ? (
					assoc('linkTo', renderProductLinkTo(shopifyProduct.handle), x)
				) : x
			),
			x => (
				shopifyProduct.priceRange ? (
					assoc('formattedPriceRange', formatPriceRange(shopifyProduct.priceRange), x)
				) : x
			),
			x => (
				shopifyProduct.shopifyId ? (
					assoc('decodedShopifyId', decode(shopifyProduct.shopifyId).id, x)
				) : x
			),
			x => (
				shopifyProduct.variants ? (
					assoc('variants', manipulateProductVariants(shopifyProduct.variants), x)
				) : x
			),
		)

		return manipulateProducts(shopifyProduct)
	}), [ mergedProducts, renderProductLinkTo, renderProductVariantLinkTo ])

	const filteredProducts = useMemo(() => {
		if (find) return manipulatedProducts.find(find)
		if (filter) return manipulatedProducts.filter(filter)
		return manipulatedProducts
	}, [ filter, find, manipulatedProducts ])

	const sortedProducts = useMemo(() => {
		if (!sort || !is(Array, filteredProducts)) {
			return filteredProducts
		}
		return filteredProducts.sort(sort)
	}, [ filteredProducts, sort ])

	const withLiveShopifyProduct = useMemo(() => {
		if (!liveShopifyProduct || is(Array, sortedProducts)) {
			return sortedProducts
		}
		if (!sortedProducts.variants) {
			const strippedLiveProduct = omit([ '__typename' ], liveShopifyProduct)
			return {
				...sortedProducts,
				...strippedLiveProduct,
			}
		}

		const updatedVariants = sortedProducts.variants.map(sortedVariant => {
			const liveVariants = path([ 'variants', 'edges' ], liveShopifyProduct)
			if (!liveVariants) {
				return sortedVariant
			}
			const { node: matchingLiveVariant } = liveVariants.find(({ node }) => (
				decode(node.id).id === sortedVariant.decodedShopifyId
			))
			const strippedLiveVariant = omit([ 'id', '__typename' ], matchingLiveVariant)
			return { ...sortedVariant, ...strippedLiveVariant }
		})
		const strippedLiveProduct = omit([ 'variants', '__typename' ], liveShopifyProduct)

		return {
			...sortedProducts,
			...strippedLiveProduct,
			variants: updatedVariants,
		}
	}, [ liveShopifyProduct, sortedProducts ])

	const findVariantResult = useMemo(() => {
		if (!withLiveShopifyProduct || is(Array, withLiveShopifyProduct) || !findVariant) {
			return withLiveShopifyProduct
		}
		const product = withLiveShopifyProduct
		const variantsWithNestedProducts = getVariantsWithNestedProductFromProduct(product)
		const foundVariant = variantsWithNestedProducts.find(findVariant)
		if (!foundVariant) {
			// eslint-disable-next-line no-console
			console.error('No variant matches query passed in `findVariant`.')
			return withLiveShopifyProduct
		}
		const productWithoutVariants = dissoc('variants', product)
		const variantWithoutProduct = dissoc('product', foundVariant)
		const productWithVariant = {
			...productWithoutVariants,
			variant: variantWithoutProduct,
		}
		return productWithVariant
	}, [ findVariant, withLiveShopifyProduct ])

	return findVariantResult
}

export default useShopifyData
