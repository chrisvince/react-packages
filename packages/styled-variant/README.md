# @sb-m/styled-variant

## Overview
`@sb-m/styled-variant` provides a way to easily manage variants using styled-components. You can set
pre-defined variant styles, and then easily use them in styled components by setting a pre-defined
prop.

## Installation
`npm install @sb-m/styled-variant`

## Usage
### Step 1
Initialize styledVariant using `initStyledVariant`.
```
import styled from 'styled-components'
import { initStyledVariant } from '@sb-m/styled-variant'

// Create variant map with styles
const variants = {
	body: css`
		font-size: 1em,
		font-weight: 400,
	`,
	danger: css`
		color: '#ff0000,
	`,
}

// Initialize styled variant
const styledVariant = initStyledVariant(variants, {
	prop: 'variant',
})

// Set styled variant in styled-component styles with optional default variant.
const Text = styled.p`
	${styledVariant({ default: 'body' })}
`

const Component = () => (
	<>
		{/* This will render with `body` styles (because default was set to `body`) */}
		<Text>
			text
		</Text>

		{/* This will render with `danger` styles */}
		<Text variant="danger">
			text
		</Text>
	</>
)
```

## API

### initStyledVariant
Returns a styledVariant style setter that can be used in styled-components styles.

#### Syntax
`const styledVariantSetter = initStyledVariant(variants, options)`

#### Parameters
| Parameter  | Description                                                                                                                                       |
|:-----------|:--------------------------------------------------------------------------------------------------------------------------------------------------|
| `variants` | A map of variants with styles using the styled-components' `css` API.                                                                             |
| `options`  | A set of options for the variant setter. Currently the only option is `prop` which sets the prop that is used to set the styles on the component. |

### styledVariantSetter
The `styledVariantSetter` is returned from the `initStyledVariant` function. It must be used in styled-components styles.

#### Syntax
```
import styled from 'styled-components'

const StyledComponent = styled.div`
	${styledVariantSetter(options)}
`
```

#### Parameters
| Parameter  | Description                                                                                                    |
|:-----------|:---------------------------------------------------------------------------------------------------------------|
| `options`  | Currently the only option is `default` which sets the default variant to be used if no variant prop is passed. |
