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
| Parameter   | Description                                    |
|:------------|:-----------------------------------------------|
| `productId` | The identifier for the product to be returned. |
| `products`  | A list of products.                            |


### productFromVariantId
Return the product of the variant that matches the variantId from a list of products.

#### Syntax
`const product = productFromVariantId(variantId, products)`

#### Parameters
| Parameter   | Description                                                    |
|:------------|:---------------------------------------------------------------|
| `variantId` | The identifier for the variant which product will be returned. |
| `products`  | A list of products.                                            |

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
Returns an object of the options as taken from the URL search parameters. If the URL search
parameters does not contain the specific value, it will return the default.

#### Syntax
`const product = getSelectedOptionsFromUrlParams(options)`

#### Usage
This function works best setting the initial selected options state. For example,
`const [ selectedOptions, setSelectedOptions ] = useState(() => getSelectedOptionsFromUrlParams(options))`

#### Parameters
| Parameter | Description                                               |
|:----------|:----------------------------------------------------------|
| `options` | The options data from the Shopify Storefront API product. |

#### Url Params
This function will respond to URL search params using the Shopify option key and value. Keep in mind
that Shopify options and values will likely be capitalized. For example,
`www.example.com/shop/product?Color=Black&Size=4`.
