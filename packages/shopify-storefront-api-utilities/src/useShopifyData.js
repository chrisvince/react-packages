import React, { useCallback } from 'react'
import { assoc, dissoc, is, mergeWithKey, omit, path, pipe, prop } from 'ramda'
import { decode } from 'shopify-gid'
import { arrayOf, checkPropTypes, func, object, shape } from 'prop-types'
import formatPrice from './formatPrice'
import formatPriceRange from './formatPriceRange'
import selectedOptionsToObject from './selectedOptionsToObject'

const DISPLAY_NAME = 'useShopifyData'

const DATA_TYPE = {
	PRODUCT: 'Product',
	PRODUCT_VARIANT: 'ProductVariant',
}

const PRODUCT_PRESERVE_LEFT = [
	'shopifyId',
]

const PRODUCT_VARIANT_PRESERVE_LEFT = [
	'shopifyId',
]

const PRODUCT_VARIANT_OMIT_PROPS = [
	'id',
	'__typename',
]

const PRODUCT_OMIT_PROPS = [
	'id',
	'__typename',
]

const handleDuplicateVariantDataPoint = (key, left, right) => {
	if (key === 'product') {
		// eslint-disable-next-line no-use-before-define
		return mergeProduct(left, right)
	}
	const persistLeft = PRODUCT_VARIANT_PRESERVE_LEFT.includes(key)
	return persistLeft ? left : right
}

const mergeVariant = (left, right) => {
	const mergedVariant = mergeWithKey(
		handleDuplicateVariantDataPoint,
		left,
		right,
	)
	const variantWithOmittedProps = omit(PRODUCT_VARIANT_OMIT_PROPS, mergedVariant)
	return variantWithOmittedProps
}

const searchForArray = pipe(
	input => {
		if (Array.isArray(input)) {
			return input
		}
		if (Array.isArray(input.edges)) {
			return input.edges
		}
		return undefined
	},
	input => {
		if (Array.isArray(input)) {
			return input.map(item => {
				if (item.node) {
					return item.node
				}
				return item
			})
		}
		return undefined
	},
)

const mergeVariants = (left, right) => {
	if (!right) {
		return left
	}
	const rightData = searchForArray(right)
	return left.map(leftItem => {
		const rightItem = (
			rightData.find(x => (
				leftItem.id === x.shopifyId
				|| x.shopifyId.toString() === decode(leftItem.shopifyId).id
			))
		)
		if (!rightItem) {
			return leftItem
		}
		return mergeVariant(
			leftItem,
			rightItem,
		)
	})
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
	} = options

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
			if (!variant.shopifyId) {
				return variant
			}
			const decodedShopifyId = decode(variant.shopifyId).id
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

			const formattedPrice = formatPrice(variant.priceV2)

			if (!variant.compareAtPriceV2) {
				return assoc('formattedPrice', <>{formattedPrice}</>, variant)
			}

			const formattedCompareAtPrice = formatPrice(variant.compareAtPriceV2)

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
	} = options

	return pipe(
		product => {
			if (!product.handle) {
				return product
			}
			const linkTo = renderProductLinkTo(product.handle)
			return assoc('linkTo', linkTo, product)
		},
		product => {
			if (!product.priceRange) {
				return product
			}
			const formattedPriceRange = formatPriceRange(product.priceRange)
			return assoc('formattedPriceRange', formattedPriceRange, product)
		},
		product => {
			if (!product.shopifyId) {
				return product
			}
			const decodedShopifyId = decode(product.shopifyId).id
			return assoc('decodedShopifyId', decodedShopifyId, product)
		},
		product => {
			if (!product.variants) {
				return product
			}
			const newVariants = handleProductVariantsManipulation(product.variants, product, {
				renderProductVariantLinkTo,
			})
			return assoc('variants', newVariants, product)
		},
	)(productParam)
}

const mergeDataItem = (left, right) => {
	const { type } = decode(left.shopifyId)
	switch (type) {
		case DATA_TYPE.PRODUCT: return mergeProduct(left, right)
		case DATA_TYPE.PRODUCT_VARIANT: return mergeVariant(left, right)
		default: return undefined
	}
}

const mergeDataHandler = data => (
	data.reduce((left, right) => (
		left.map(leftItem => {
			const rightItem = right.find(item => (
				leftItem.shopifyId === item.id
				|| decode(leftItem.shopifyId).id === item.shopifyId.toString()
			))
			return mergeDataItem(leftItem, rightItem)
		})
	))
)

const mergeDataSingleHandler = (data, dataSingle) => (
	dataSingle.reduce((leftItem, rightItem) => {
		if (!rightItem) {
			return leftItem
		}
		return mergeDataItem(leftItem, rightItem)
	}, data)
)

const manipulateDataHandler = (data, options) => data.map(dataItem => {
	const { type } = decode(dataItem.shopifyId)
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
		} = {},
		sort,
	} = props

	const mergeData = useCallback(mergeDataHandler, [])

	const manipulateData = useCallback(data => manipulateDataHandler(data, {
		renderProductLinkTo,
		renderProductVariantLinkTo,
	}), [ renderProductLinkTo, renderProductVariantLinkTo ])

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

	const processDataSets = useCallback(data => pipe(
		mergeData,
		manipulateData,
		filtering,
		sorting,
		mergeDataSingle,
		findVariant,
	)(data), [
		filtering,
		findVariant,
		manipulateData,
		mergeData,
		mergeDataSingle,
		sorting,
	])

	return processDataSets(dataProp)
}

export default useShopifyData
