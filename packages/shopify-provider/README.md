# @nmsp/shopify-provider

## Overview
`@nmsp/shopify-provider` is a React provider for managing Shopify line items and checkout. It allows
you to add, remove, and update line items, and prepare a Shopify checkout to redirect to.

## Installation
`npm install @nmsp/shopify-provider`

## Provider
The provider manages lineItems and checkout data.
```
import { Provider as ShopifyProvider } from '@nmsp/shopify-provider'

const credentials = {
	domain: 'YOUR_SHOPIFY_DOMAIN',
	storefrontAccessToken: 'YOUR_SHOPIFY_STOREFRONT_ACCESS_TOKEN',
}

const App = () => (
	<ShopifyProvider credentials={credentials}>
		// App
	</ShopifyProvider>
)
```

## useLineItems
Hook to manage line items. You can use `useLineItems` anywhere inside the `Provider`.

### Syntax
```
import { useLineItems } from '@nmsp/shopify-provider'

const Component = () => {
	const { add, lineItems } = useLineItems({
		variantData: // pass in array of variant data add to lineItem data
	})

	return (
		<ul>
			{lineItems.map(({ variantId, quantity }) => (
				<li key={variantId}>
					Variant ID: {variantId}
					Quantity: {quantity}
				</li>
			))}s
		</ul>
	)
}
```

### Functions
Functions returned by `useLineItems`

#### add
Adds variant to line items.
##### Syntax
```
const { add } = useLineItems()

add(variantId, quantity)
```

#### remove
Removes line items.
##### Syntax
```
const { remove } = useLineItems()

remove(variantId)
```

#### setQuantity
Sets a line item quantity.
##### Syntax
```
const { setQuantity } = useLineItems()

setQuantity(variantId, quantity)
```

#### increment
Increments a line item quantity.
##### Syntax
```
const { increment } = useLineItems()

increment(variantId)
```

#### decrement
Decrements a line item quantity.
##### Syntax
```
const { decrement } = useLineItems()

decrement(variantId)
```

### Data
Data returned from `useLineItems`

#### lineItems
An array of current line items.

##### Syntax
```
const { lineItems } = useLineItems()

console.log(lineItems)
/*
	Example data: [
		{
			variantId: 'variantId',
			quantity: 1,
		}
	]
*/
```

## useCheckout
Hook to manage Shopify checkout. You can use `useCheckout` anywhere inside the `Provider`.
`useCheckout` uses line items set by `useLineItems`.

### Functions
#### prepare
Prepares a checkout either by creating a new one, or updating the existing one (it does this
automatically). It will return a checkout.

##### Syntax
```
const { prepare } = useCheckout()

const checkout = await prepare()

console.log(checkout.webUrl) // URL to redirect to Shopify Checkout
```

### Data
#### id
The current Shopify checkout ID.

##### Syntax
```
const { id } = useCheckout()

console.log(id) // Shopify Checkout
```

#### loading
Will be true if the checkout is loading.

##### Syntax
```
const { loading } = useCheckout()

console.log(loading) // true if loading
```

#### client
The Shopify client returned from [shopify-buy](https://shopify.github.io/js-buy-sdk).

##### Syntax
```
const { client } = useCheckout()

// Use client (see shopify-buy documentation). For example:
client.checkout.addDiscount(checkoutId, discountCode)
```
