# @sb-m/shopify-storefront-api-utilities

## Overview
`@sb-m/shopify-storefront-api-utilities` contains functions for working with data from the
Shopify Storefront API.

## Installation
`npm install @sb-m/shopify-storefront-api-utilities`

## Usage
Each utility function can be imported as a named import. For example, `import { productFromProductId } from '@sb-m/shopify-storefront-api-utilities'`.

## Available Functions
### productFromProductId
Return the product that matches the productId from a list of products.

#### Syntax
`const product = productFromProductId(productId, products)`

#### Parameters
| Parameter   | Description                                                                                                                                        |
|:------------|:---------------------------------------------------------------------------------------------------------------------------------------------------|
| `productId` | The identifier for the product to be returned. Note: this is the `shopifyId` passed from `gatsby-source-shopify-storefront`, not the regular `id`. |
| `products`  | A list of products.                                                                                                                                |


### productFromVariantId
Return the product of the variant that matches the variantId from a list of products.

#### Syntax
`const product = productFromVariantId(variantId, products)`

#### Parameters
| Parameter   | Description                                                                                                                                                        |
|:------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `variantId` | The identifier for the variant which product will be returned. Note: this is the `shopifyId` passed from `gatsby-source-shopify-storefront`, not the regular `id`. |
| `products`  | A list of products.                                                                                                                                                |

#### Considerations
The products passed must include the variants and their IDs in order for the product to be found.
For example,
```
const products = [
	{
		title: 'Product 1',
		variants: [
			{
				id: 'variant-1-id',
				title: 'Product 1, variant 1',
			},
		]
	}
]

const product = productFromVariantId('variant-1-id', products)

/*
product === {
	title: 'Product 1',
	variants: [
		{
			id: 'variant-1-id',
			title: 'Product 1, variant 1',
		},
	]
}
*/
```

### getSelectedOptionsFromUrlParams
Returns an object of the product options as taken from the URL search parameters. If
the URL search parameters does not contain a valid value, it will return the default
options (the first). The options array from the product data point should be be
passed as the first argument.

#### Syntax
`const product = getSelectedOptionsFromUrlParams(options)`

#### Usage
This function is intended to be used to set the selectedOptions initial state. For
example,
`const [ selectedOptions, setSelectedOptions ] = useState(() => getSelectedOptionsFromUrlParams(options))`

#### Parameters
| Parameter | Description                                               |
|:----------|:----------------------------------------------------------|
| `options` | The options data from the Shopify Storefront API product. |

#### Url Params
This function will respond to URL search params using the Shopify option key and value. Keep in mind
that Shopify options and values will likely be capitalized. For example,
`www.example.com/shop/product?Color=Black&Size=4`.


### filterUniqueVariantsByOption
Filters variants so that the returned variants are unique according to the optionName(s) passed as
the first argument. For example, if you have multiple variants with multiple colors and sizes, but
only want to show the variants with unique colors, you could pass 'colors' as the first argument and
it will filter accordingly.

#### Minimum GraphQL Data Requirement
In order for this utility to work, any variants must include at minimum the data outlined below in
the GraphQL example.
```
	query {
		allShopifyProductVariant {
			nodes {
				shopifyId
				selectedOptions {
					value
					name
				}
				product {
					shopifyId
				}
			}
		}
	}
```

#### Syntax
`const filteredVariants = filterUniqueVariantsByOption(optionNames, variants)`

#### Usage
```
// with string
const filteredVariants = filterUniqueVariantsByOption('Color', variants)

// with array
const filteredVariants = filterUniqueVariantsByOption([ 'Color', 'Strap Color' ], variants)
```

#### Parameters
| Parameter     | Type                | Description                                                              |
|:--------------|:--------------------|:-------------------------------------------------------------------------|
| `optionNames` | `String` or `Array` | The option or options the returned list of variants should be unique by. |
| `variants`    | `Array`             | An array of product variants from the Shopify Storefront API.            |


### formatPriceRange
Formats price range from a price range object from Shopify Storefront API. If the prices match, a
single price will be passed, if only the currency codes match, the currency code will be shown with
the price range, if both the currency code and the price doesn't match, it will show both the
minimum and maximum currency code and price.

#### Minimum GraphQL Data Requirement
In order for this utility to work, the 'priceRange' object must be passed with 'minVariantPrice' and
'maxVariantPrice' objects with their 'amount' and 'currencyCode' data points.
```
	query {
		allShopifyProduct {
			nodes {
				...
				priceRange {
					minVariantPrice {
						currencyCode
						amount
					}
					maxVariantPrice {
						currencyCode
						amount
					}
				}
				...
			}
		}
	}
```

#### Syntax
`const priceRange = formatPriceRange(priceRange)`

#### Usage
```
// Price range object mock
const priceRange = {
	minVariantPrice: {
		currencyCode: "USD",
		amount: "120.00",
	},
	maxVariantPrice: {
		currencyCode: "USD",
		amount: "140.0",
	}
}

const price = renderPriceFromPriceRange(priceRange)
// USD $120.00-$140.00
```

#### Parameters
| Parameter    | Type     | Description                                                       |
|:-------------|:---------|:------------------------------------------------------------------|
| `priceRange` | `Object` | A priceRange object from the Storefront API.                      |
| `options`    | `Object` | Options object same as `formatPrice` utility (See 'formatPrice'). |


### formatPrice
Formats a price based on a price object passed from the Shopify Storefront API. The number format
can be changed by passing a [numeral format](http://numeraljs.com/#format) in the options object.

#### Minimum GraphQL Data Requirement
In order for this utility to work, the 'price' object must be passed with 'amount' and
'currencyCode' data points. For example,
```
	query {
		allShopifyProduct {
			nodes {
				...
				priceV2 {
					currencyCode
					amount
				}
				...
			}
		}
	}
```

#### Syntax
`const price = formatPrice(price, options)`

#### Usage
```
// Price object mock
const price = {
	currencyCode: "USD",
	amount: "1200.00",
}

const formattedPrice = formatPrice(price)
// USD $1,200.00

// With options
const options = {
	format: '$0,0',
}

const formattedPriceWithOptions = formatPrice(price, options)
// USD $1,200
```

#### Parameters
| Parameter | Type     | Description                                                                                                                                                     |
|:----------|:---------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `price`   | `Object` | A price object from the Storefront API.                                                                                                                         |
| `options` | `Object` | Includes `format` which will format the number accordingly. Includes `showCurrency` which defaults to `true`, if set to `false`, currency will not be rendered. |


### splitProductsByOption
Splits a product and its variants by a specific option. Each value of an option will be split into
different objects. These objects will include a product object, and a variants array which will
contain all the variants with the same object value. Because the data is split based on option
value, and since there can be multiple object values per product, there will be duplicate products
in the cases where there are more than one object value. This can be used for PLPs where separate
list items need to be shown for each option value (for example, a product in all the colors
offered).

#### Minimum GraphQL Data Requirement
```
	query {
		allShopifyProduct {
			nodes {
				handle
				options {
					name
					values
				}
				variants {
					selectedOptions {
						value
						name
					}
				}
			}
		}
	}
```

#### Syntax
`const options = splitProductsByOption(optionName, products)`

#### Usage
```
const options = splitProductsByOption('Color', products)
// returns:
// 	[
// 		{
// 			optionValue: 'Black',
// 			to: '/shop/dress?Color=Black
// 			product: {
// 				handle: 'dress',
// 				// other product data passed to fn for 'dress'
// 			},
// 			variants: [
// 				// 'dress' variants where Color === 'Black'
// 			],
// 		},
// 		{
// 			optionValue: 'Red',
// 			to: '/shop/dress?Color=Red
// 			product: {
// 				handle: 'dress',
// 				// other product data passed to fn for 'dress'
// 			},
// 			variants: [
// 				// 'dress' variants where Color === 'Red'
// 			],
// 		},
// 	]
```

#### Parameters
| Parameter    | Type     | Description                                                                                                                       |
|:-------------|:---------|:----------------------------------------------------------------------------------------------------------------------------------|
| `optionName` | `String` | The option that the products should be split by.                                                                                  |
| `products`   | `Object` | An array of objects from the Storefront API.                                                                                      |
| `options`    | `Object` | An object of options. Includes `productPagePathPrefix` which will change the prefix to the `to` data point (defaults to '/shop'). |
