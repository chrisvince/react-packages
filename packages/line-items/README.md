# @nmsp/line-items

## Overview
`@nmsp/line-items` contains some handy utility functions for manipulating line-item data. Line item
data is best stored in state management (i.e. redux).

## Installation
`npm install @nmsp/line-items`

## Usage
Each utility function can be imported as a named import. For example, `import { add } from '@nmsp/line-items'`.

## Available functions

### add
Adds a new line item to an existing line item list with the specified quantity. If the line item
already exists, the line item quantity will increase by quantity specified. Returns a new list of
line items.

#### Syntax
`const newLineItems = add(variantId, quantity, existingLineItems)`

#### Parameters
| Parameter           | Description                                              |
|:--------------------|:---------------------------------------------------------|
| `variantId`         | The identifier for the line item to be added.            |
| `quantity`          | The quantity of the variant to be added (defaults to 1). |
| `existingLineItems` | The existing line items list.                            |

### remove
Removes a line item from a line item list. Returns a new list of line items.

#### Syntax
`const newLineItems = remove(variantId, existingLineItems)`

#### Parameters
| Parameter           | Description                                     |
|:--------------------|:------------------------------------------------|
| `variantId`         | The identifier for the line item to be removed. |
| `existingLineItems` | The existing line items list.                   |

### increment
Increments an existing line item. Returns a new list of line items.

#### Syntax
`const newLineItems = increment(variantId, existingLineItems)`

#### Parameters
| Parameter           | Description                                         |
|:--------------------|:----------------------------------------------------|
| `variantId`         | The identifier for the line item to be incremented. |
| `existingLineItems` | The existing line items list.                       |

### decrement
Decrements an existing line item. If the decremented line item quantity is zero, the line item will
be removed from the line item list. Returns a new list of line items.

#### Syntax
`const newLineItems = decrement(variantId, existingLineItems)`

#### Parameters
| Parameter           | Description                                         |
|:--------------------|:----------------------------------------------------|
| `variantId`         | The identifier for the line item to be decremented. |
| `existingLineItems` | The existing line items list.                       |

### updateQuantity
Updates the quantity of an existing line item. If the quantity is zero, the line item is removed.
Returns a new list of line items.

#### Syntax
`const newLineItems = updateQuantity(variantId, quantity, existingLineItems)`

#### Parameters
| Parameter           | Description                                     |
|:--------------------|:------------------------------------------------|
| `variantId`         | The identifier for the line item to be updated. |
| `quantity`          | The quantity to update the existing variant.    |
| `existingLineItems` | The existing line items list.                   |
