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
