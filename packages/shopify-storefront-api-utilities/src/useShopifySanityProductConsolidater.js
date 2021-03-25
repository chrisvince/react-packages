import { useMemo } from 'react'
import { assoc, dissoc, is, mergeWithKey, omit, pipe, prop } from 'ramda'
import { decode } from 'shopify-gid'
import formatPriceRange from './formatPriceRange'

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

const useShopifySanityProductConsolidater = props => {
	const {
		allShopifyProduct,
		allSanityProduct,
		liveShopifyData,
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

	if (!allShopifyProduct) {
		console.error('`allShopifyProduct` must be set.')
		return
	}

	const { nodes: shopifyProducts } = allShopifyProduct
	const { nodes: sanityProducts } = allSanityProduct || {}

	const productByHandle = prop('productByHandle', liveShopifyData)

	const mergedProducts = useMemo(() => {
		if (!sanityProducts) {
			return shopifyProducts
		}
		return mergeProducts(shopifyProducts, sanityProducts)
	}, [ sanityProducts, shopifyProducts ])

	const manipulatedProducts = useMemo(() => mergedProducts.map(shopifyProduct => {
		const manipulatedVariants = shopifyProduct.variants.map(variant => {
			const renderVariantReturn = pipe(
				x => (shopifyProduct.handle && variant.selectedOptions) ? {
					...x,
					linkTo: renderProductVariantLinkTo(
						shopifyProduct.handle,
						variant.selectedOptions,
					),
				} : x,
				x => variant.shopifyId ? {
					...x,
					decodedShopifyId: decode(variant.shopifyId).id,
				} : x,
			)
			return renderVariantReturn(variant)
		})

		const renderProductReturn = pipe(
			x => shopifyProduct.handle ? {
				...x,
				linkTo: renderProductLinkTo(shopifyProduct.handle),
			} : x,
			x => shopifyProduct.priceRange ? {
				...x,
				formattedPriceRange: formatPriceRange(shopifyProduct.priceRange),
			} : x,
			x => shopifyProduct.shopifyId ? {
				...x,
				decodedShopifyId: decode(shopifyProduct.shopifyId).id,
			} : x,
			x => ({ ...x, variants: manipulatedVariants }),
		)
		return renderProductReturn(shopifyProduct)
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

	const withProductByHandle = useMemo(() => {
		if (!productByHandle || is(Array, sortedProducts)) {
			return sortedProducts
		}
		const liveVariants = productByHandle.variants.edges.map(liveVariantEdge => {
			const { node } = liveVariantEdge
			const decodedShopifyId = decode(node.id).id
			return {
				...node,
				decodedShopifyId,
			}
		})
		const updatedVariants = sortedProducts.variants.map(sortedProduct => {
			const matchingLiveVariant = liveVariants.find(liveVariant => (
				liveVariant.decodedShopifyId === sortedProduct.decodedShopifyId
			))
			const strippedLiveVariant = omit([ 'decodedShopifyId', 'id', '__typename' ], matchingLiveVariant)
			return {
				...sortedProduct,
				...strippedLiveVariant,
			}
		})

		const strippedLiveProduct = omit([ 'variants', '__typename' ], productByHandle)

		return {
			...sortedProducts,
			...strippedLiveProduct,
			variants: updatedVariants,
		}
	}, [ productByHandle, sortedProducts ])

	const findVariantResult = useMemo(() => {
		if (!withProductByHandle || is(Array, withProductByHandle) || !findVariant) {
			return withProductByHandle
		}
		const product = withProductByHandle
		const variantsWithNestedProducts = getVariantsWithNestedProductFromProduct(product)
		const foundVariant = variantsWithNestedProducts.find(findVariant)
		if (!foundVariant) {
			// eslint-disable-next-line no-console
			console.error('No variant matches query passed in `findVariant`.')
			return withProductByHandle
		}
		const productWithoutVariants = dissoc('variants', product)
		const variantWithoutProduct = dissoc('product', foundVariant)
		const productWithVariant = {
			...productWithoutVariants,
			variant: variantWithoutProduct,
		}
		return productWithVariant
	}, [ findVariant, withProductByHandle ])

	return findVariantResult
}

export default useShopifySanityProductConsolidater
