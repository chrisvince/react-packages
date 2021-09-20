import React, { useCallback, useMemo } from 'react'
import { assoc, dissoc, is, mergeWithKey, omit, path, pipe, prop } from 'ramda'
import { decode } from 'shopify-gid'
import { arrayOf, bool, checkPropTypes, func, object, shape } from 'prop-types'
import {
	formatPrice,
	formatPriceRange,
	selectedOptionsToObject,
} from '@nmsp/shopify-storefront-api-utilities'

const DISPLAY_NAME = 'useShopifyData'

const DATA_TYPE = {
	PRODUCT: 'Product',
	PRODUCT_VARIANT: 'ProductVariant',
}

const PRODUCT_PRESERVE_LEFT = [
	'shopifyId',
	'storefrontId',
]

const PRODUCT_VARIANT_PRESERVE_LEFT = [
	'shopifyId',
	'storefrontId',
]

const PRODUCT_VARIANT_OMIT_PROPS = [
	'id',
	'__typename',
]

const PRODUCT_OMIT_PROPS = [
	'id',
	'__typename',
]

const removeEdgesAndNodeNesting = pipe(
	input => {
		if (is(Array, input)) {
			return input
		}
		if (is(Array, input?.edges)) {
			return input.edges
		}
		return input
	},
	input => {
		if (is(Array, input)) {
			return input.map(item => {
				if (item?.node) {
					return item.node
				}
				return item
			})
		}
		return input
	},
)

const handleDuplicateVariantDataPoint = (key, left, right) => {
	if (key === 'product') {
		// eslint-disable-next-line no-use-before-define
		return mergeProduct(left, right)
	}
	const persistLeft = PRODUCT_VARIANT_PRESERVE_LEFT.includes(key)
	return persistLeft ? left : right
}

const mergeVariant = (left, right) => {
	if (!right) return left
	const leftData = removeEdgesAndNodeNesting(left)
	const rightData = removeEdgesAndNodeNesting(right)
	const mergedVariant = mergeWithKey(
		handleDuplicateVariantDataPoint,
		leftData,
		rightData,
	)
	const variantWithOmittedProps = omit(PRODUCT_VARIANT_OMIT_PROPS, mergedVariant)
	return variantWithOmittedProps
}

const findMatchingRight = (left, rightItems) => {
	const rightData = removeEdgesAndNodeNesting(rightItems)
	return rightData.find(right => {
		const checkMatch = (x, y) => matched => {
			if (matched) return true
			if (x && y) return x === y
			return false
		}
		return pipe(
			checkMatch(left.storefrontId, right.storefrontId),
			checkMatch(left.id, right.id),
			checkMatch(left.storefrontId, right.id),
			checkMatch(left.id, right.storefrontId),
		)(false)
	})
}

const matchItems = (left, right) => left.map(leftItem => (
	[ leftItem, findMatchingRight(leftItem, right) ]
))

const mergeVariants = (left, right) => {
	if (!right) return left
	const matchedItems = matchItems(left, right)
	return matchedItems.map(([ leftItem, rightItem ]) => mergeVariant(leftItem, rightItem))
}

const handleDuplicateProductDataPoint = (key, left, right) => {
	if (key === 'variants') {
		const mergedVariants = mergeVariants(left, right)
		return mergedVariants
	}
	const persistLeft = PRODUCT_PRESERVE_LEFT.includes(key)
	return persistLeft ? left : right
}

const mergeProduct = (left, right) => {
	if (!right) return left
	const mergedProduct = mergeWithKey(
		handleDuplicateProductDataPoint,
		left,
		right,
	)
	const productWithOmittedProps = omit(PRODUCT_OMIT_PROPS, mergedProduct)
	return productWithOmittedProps
}

const getVariantsWithNestedProductFromProduct = product => product.variants.map(variant => {
	const productWithoutVariants = dissoc('variants', product)
	return assoc('product', productWithoutVariants, variant)
})

const renderOptionQueryString = selectedOptions => (
	selectedOptions.map(({ name, value }) => `${name}=${value}`).join('&')
)

const manipulateProductVariant = (variantParam, product, options) => {
	const {
		renderProductVariantLinkTo,
		renderProductLinkTo,
		alwaysShowCents,
		showCurrency,
	} = options

	const formatPriceOptions = {
		alwaysShowCents,
		showCurrency,
	}

	return pipe(
		variant => {
			const handle = prop('handle', product) || path([ 'product', 'handle' ], variant)
			if (!handle || !variant.selectedOptions) {
				return variant
			}
			const linkTo = renderProductVariantLinkTo(handle, variant.selectedOptions)
			return assoc('linkTo', linkTo, variant)
		},
		variant => {
			if (!variant.storefrontId) {
				return variant
			}
			const decodedShopifyId = decode(variant.storefrontId).id
			return assoc('decodedShopifyId', decodedShopifyId, variant)
		},
		variant => {
			if (!variant.selectedOptions) {
				return variant
			}
			const selectedOptionsMap = selectedOptionsToObject(variant.selectedOptions)
			return assoc('selectedOptionsMap', selectedOptionsMap, variant)
		},
		variant => {
			if (!variant.priceV2) {
				return variant
			}

			const formattedPrice = formatPrice(variant.priceV2, formatPriceOptions)

			if (!variant.compareAtPriceV2) {
				return assoc('formattedPrice', <>{formattedPrice}</>, variant)
			}

			const formattedCompareAtPrice = formatPrice(variant.compareAtPriceV2, formatPriceOptions)

			const renderPrice = (
				<>
					<del>{formattedCompareAtPrice}</del>
					&ensp;
					<ins>{formattedPrice}</ins>
				</>
			)
			return assoc('formattedPrice', renderPrice, variant)
		},
		variant => {
			if (!variant.product) {
				return variant
			}
			// eslint-disable-next-line no-use-before-define
			const newProduct = manipulateProduct(variant.product, {
				renderProductLinkTo,
				renderProductVariantLinkTo,
				alwaysShowCents,
				showCurrency,
			})
			return assoc('product', newProduct, variant)
		},
	)(variantParam)
}

const handleProductVariantsManipulation = (variants, product, options) => (
	variants.map(variant => manipulateProductVariant(variant, product, options))
)

const manipulateProduct = (productParam, options) => {
	const {
		renderProductLinkTo,
		renderProductVariantLinkTo,
		alwaysShowCents,
		showCurrency,
	} = options

	const formatPriceOptions = {
		alwaysShowCents,
		showCurrency,
	}

	return pipe(
		product => {
			if (!product.handle) {
				return product
			}
			const linkTo = renderProductLinkTo(product.handle)
			return assoc('linkTo', linkTo, product)
		},
		product => {
			if (!product.priceRangeV2) {
				return product
			}
			const formattedPriceRange = formatPriceRange(product.priceRangeV2, formatPriceOptions)
			return assoc('formattedPriceRange', formattedPriceRange, product)
		},
		product => {
			if (!product.storefrontId) {
				return product
			}
			const decodedShopifyId = decode(product.storefrontId).id
			return assoc('decodedShopifyId', decodedShopifyId, product)
		},
		product => {
			if (!product.variants) {
				return product
			}
			const newVariants = handleProductVariantsManipulation(product.variants, product, {
				renderProductVariantLinkTo,
				alwaysShowCents,
				showCurrency,
			})
			return assoc('variants', newVariants, product)
		},
	)(productParam)
}

const mergeDataItem = (left, right) => {
	if (!right) return left
	const { type } = decode(left.storefrontId)
	switch (type) {
		case DATA_TYPE.PRODUCT: return mergeProduct(left, right)
		case DATA_TYPE.PRODUCT_VARIANT: return mergeVariant(left, right)
		default: return undefined
	}
}

const mergeDataHandler = data => data.reduce((left, right) => {
	const leftData = removeEdgesAndNodeNesting(left)
	const rightData = removeEdgesAndNodeNesting(right)
	const matchedItems = matchItems(leftData, rightData)
	const mergedItems = matchedItems.map(([ leftItem, rightItem ]) => (
		mergeDataItem(leftItem, rightItem)
	))
	return mergedItems
})

const mergeDataSingleHandler = (data, dataSingle) => dataSingle.reduce((leftItem, rightItem) => {
	if (!rightItem) return leftItem
	const rightItemData = removeEdgesAndNodeNesting(rightItem)
	return mergeDataItem(leftItem, rightItemData)
}, data)

const manipulateDataHandler = (data, options) => data.map(dataItem => {
	const { type } = decode(dataItem.storefrontId)
	switch (type) {
		case DATA_TYPE.PRODUCT: {
			return manipulateProduct(dataItem, options)
		}
		case DATA_TYPE.PRODUCT_VARIANT: {
			return manipulateProductVariant(dataItem, null, options)
		}
		default: return data
	}
})

const PROP_TYPES = {
	data: arrayOf(arrayOf(object)).isRequired,
	dataSingle: arrayOf(object),
	filter: func,
	find: func,
	findVariant: func,
	options: shape({
		renderProductLinkTo: func,
		renderProductVariantLinkTo: func,
		alwaysShowCents: bool,
		showCurrency: bool,
	}),
	sort: func,
}

const useShopifyData = props => {
	checkPropTypes(PROP_TYPES, props, 'prop', DISPLAY_NAME)

	const {
		data: dataProp,
		dataSingle,
		filter,
		find,
		findVariant: findVariantProp,
		options: {
			renderProductLinkTo = handle => `/shop/${handle}`,
			renderProductVariantLinkTo = (handle, selectedOptions) => (
				`/shop/${handle}?${renderOptionQueryString(selectedOptions)}`
			),
			alwaysShowCents,
			showCurrency,
		} = {},
		sort,
	} = props

	const mergeData = useCallback(mergeDataHandler, [])

	const manipulateData = useCallback(data => manipulateDataHandler(data, {
		renderProductLinkTo,
		renderProductVariantLinkTo,
		alwaysShowCents,
		showCurrency,
	}), [ alwaysShowCents, renderProductLinkTo, renderProductVariantLinkTo, showCurrency ])

	const filtering = useCallback(input => {
		if (find) return input.find(find)
		if (filter) return input.filter(filter)
		return input
	}, [ filter, find ])

	const sorting = useCallback(input => {
		if (!sort || !is(Array, input)) {
			return input
		}
		return input.sort(sort)
	}, [ sort ])

	const mergeDataSingle = useCallback(input => {
		if (!dataSingle || is(Array, input)) {
			return input
		}
		return mergeDataSingleHandler(input, dataSingle)
	}, [ dataSingle ])

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

	const processedData = useMemo(() => pipe(
		mergeData,
		manipulateData,
		filtering,
		sorting,
		mergeDataSingle,
		findVariant,
	)(dataProp), [
		dataProp,
		filtering,
		findVariant,
		manipulateData,
		mergeData,
		mergeDataSingle,
		sorting,
	])

	return processedData
}

export default useShopifyData
