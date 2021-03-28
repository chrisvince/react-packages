import { useCallback, useMemo } from 'react'
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

const mergeSanityProductsWithShopifyProducts = (shopifyProducts, sanityProducts) => {
	if (!sanityProducts) {
		return shopifyProducts
	}

	return shopifyProducts.map(shopifyProduct => {
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
}

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
		findVariant: findVariantProp,
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

	const mergeSanityProducts = useCallback(products => (
		mergeSanityProductsWithShopifyProducts(products, sanityProducts)
	), [ sanityProducts ])

	const manipulateProducts = useCallback(products => products.map(product => {
		const handleProductVariants = variants => variants.map(pipe(
			variant => (
				(product.handle && variant.selectedOptions) ? (
					assoc(
						'linkTo',
						renderProductVariantLinkTo(product.handle, variant.selectedOptions),
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

		const handleProducts = pipe(
			x => (
				product.handle ? (
					assoc('linkTo', renderProductLinkTo(product.handle), x)
				) : x
			),
			x => (
				product.priceRange ? (
					assoc('formattedPriceRange', formatPriceRange(product.priceRange), x)
				) : x
			),
			x => (
				product.shopifyId ? (
					assoc('decodedShopifyId', decode(product.shopifyId).id, x)
				) : x
			),
			x => (
				product.variants ? (
					assoc('variants', handleProductVariants(product.variants), x)
				) : x
			),
		)
		return handleProducts(product)
	}), [ renderProductLinkTo, renderProductVariantLinkTo ])

	const filterProducts = useCallback(products => {
		if (find) return products.find(find)
		if (filter) return products.filter(filter)
		return products
	}, [ filter, find ])

	const sortProducts = useCallback(input => {
		if (!sort || !is(Array, input)) {
			return input
		}
		return input.sort(sort)
	}, [ sort ])

	const mergeLiveShopifyProduct = useCallback(input => {
		if (!liveShopifyProduct || is(Array, input)) {
			return input
		}
		const product = input
		if (!product.variants) {
			const strippedLiveProduct = omit([ '__typename' ], liveShopifyProduct)
			return {
				...product,
				...strippedLiveProduct,
			}
		}

		const updatedVariants = product.variants.map(sortedVariant => {
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
			...product,
			...strippedLiveProduct,
			variants: updatedVariants,
		}
	}, [ liveShopifyProduct ])

	const findVariant = useCallback(input => {
		if (!input || is(Array, input) || !findVariantProp) {
			return input
		}
		const product = input
		const variantsWithNestedProducts = getVariantsWithNestedProductFromProduct(product)
		const foundVariant = variantsWithNestedProducts.find(findVariantProp)
		if (!foundVariant) {
			// eslint-disable-next-line no-console
			console.error('No variant matches query passed in `findVariant`.')
			return product
		}
		const productWithoutVariants = dissoc('variants', product)
		const variantWithoutProduct = dissoc('product', foundVariant)
		const productWithVariant = {
			...productWithoutVariants,
			variant: variantWithoutProduct,
		}
		return productWithVariant
	}, [ findVariantProp ])

	return useMemo(() => (
		pipe(
			mergeSanityProducts,
			manipulateProducts,
			filterProducts,
			sortProducts,
			mergeLiveShopifyProduct,
			findVariant,
		)(shopifyProducts)
	), [
		filterProducts,
		findVariant,
		mergeLiveShopifyProduct,
		manipulateProducts,
		mergeSanityProducts,
		shopifyProducts,
		sortProducts,
	])
}

export default useShopifyData
