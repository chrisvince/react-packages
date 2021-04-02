# @sb-m/overlay

## Overview
`@sb-m/overlay` is a simple, unopinionated and flexible overlay UI component/provider.

## Installation
`npm install @sb-m/overlay`

## Usage
First, you need to wrap your app in the `Provider`. This is where the overlay will be, so make sure
it's high in your app hierarchy. You must also pass in all the components you want to use, these
will be used as overlays and can be invoked using the `useOverlay` hook in any child component.

```
import { Provider as OverlayProvider } from '@sb-m/overlay'
import OverlayComponentOne from 'overlays/OverlayComponentOne'
import OverlayComponentTwo from 'overlays/OverlayComponentTwo'

const overlayComponents = {
	OverlayComponentOne,
	OverlayComponentTwo,
	// ...other overlay components
}

const App = ({ children }) => {
	<OverlayProvider components={overlayComponents}>
		{children}
	</OverlayProvider>
}

export default App
```

Once you have added the `Provider`, you can invoke an overlay from any child component like this.

```
import { useOverlay } from '@sb-m/overlay'

const Component = () => {
	const {
		isShown, // boolean whether or not the current modal is shown (see 'isShown' below)
		setShown, // function to set whether or not the overlay is shown (i.e. `setShown(true) or setShown(false))
	} = useOverlay({
		component: 'OverlayComponentOne', // this string needs to match a component passed into the provider
		props: { prop1: 'foo' }, // any props passed to the OverlayComponentOne component
		zIndex: 8000, // the z-index of the overlay (defaults to 8500)
		closeOnBackdropClick: false, // whether the overlay should close when the user clicks the backdrop (defaults to `true`)
	})
}

export default Component
```

## No `component` Value Behavior
The behavior of the `isShown` value returned from `useOverlay` will differ depending on what
settings are passed. If the `component` value is passed, `isShown` will only be true if that
specific component is shown (if another component is shown, it will stay false). If no `component`
value is passed, `isShown` will be true if the overlay is shown no matter what component is shown
This prevents all `isShown` values in the app from being true if one overlay is open.

If you want to know if any overlay is open you can simply use a `useOverlay` hook with no
`component` value set, for example:

```
const { isShown } = useOverlay()
// isShown will be true no matter what overlay component is shown.
```

The an overlay can also be unshown using `setShown(false)` if there is no `component` value passed,
but setting `setShown(true)` will only work if the `component` value is set.
