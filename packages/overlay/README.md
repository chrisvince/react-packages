# @sb-m/overlay

## Overview
`@sb-m/overlay` is a simple, unopinionated and flexible overlay UI component/provider.

## Installation
`npm install @sb-m/overlay`

## Usage
### Provider
First, you need to wrap your app in the `Provider`. This is where the overlay will be, so make sure
it's high in your app hierarchy. You must also pass in all the components you want to use, these
will be used as overlays and can be invoked using the `useOverlay` or `useMountOverlay` hooks in
child components. It is recommended to utilize a code-spliting library such as
[loadable-components](https://loadable-components.com/).

```
import { Provider as OverlayProvider } from '@sb-m/overlay'
import OverlayComponentOne from '../OverlayComponentOne'
import loadable from '@loadable/component'

const OVERLAY_COMPONENTS = {
	OverlayComponentOne, // without code-splitting
	OverlayComponentTwo: loadable(() => import('../overlay/OverlayComponentTwo')), // with code-splitting, recommended
}

const App = ({ children }) => {
	<OverlayProvider components={OVERLAY_COMPONENTS}>
		{children}
	</OverlayProvider>
}

export default App
```

### useMountOverlay
`useMountOverlay` manages mounting and unmounting of overlays. It will not allow for any animations
(we'll look at that later with `useOverlay`).

#### Basic usage
```
	const { setMounted, isMounted } = useMountOverlay({
		component: 'OverlayComponentTwo',
		props: {
			// these props will be passed to the component
		},
		zIndex: 8500, // defaults to 8500
		onCloseRequested: () => console.log('Close requested from `useOverlay` or because the user clicking the backdrop or hit the `esc` key')
	})

	setMounted(true) // mounts the specified component (with the passed props and zIndex)
	setMounted(false) // unmounts the specified component
	console.log(isMounted) // true when the specified component is mounted, false when it is not
```

### useOverlay
`useOverlay` is useful if you want to integrate animations. `useOverlay` accepts most of the same
data as `useMountOverlay`, except for `onCloseRequested`. `useOverlay` returns `setShow` function
and `isShown` value. The big difference with `useOverlay` is that when the overlay show is set to
`false` using `setShow(false)`, it will not unmount the component, instead it will call the
`onCloseRequested` function on `useMountOverlay` at which point the overlay should be animated out
before calling `setMounted(false)` (using `useMountOverlay`) to finally unmount the overlay.

```
const { setShow, isShown } = useOverlay({
	component: 'OverlayComponentTwo', // same as `useMountOverlay`
	props: {
		// same as `useMountOverlay`
	}
	zIndex: 8500, // same as `useMountOverlay`
})
```

### Example usage with react-spring
This is an example of an overlay component (passed to the `Provider`).

```
import React, { useCallback, useEffect, useState } from 'react'
import { useMountOverlay } from '@sb-m/overlay'
import { animated, useSpring } from 'react-spring'

const Component = () => {
	const [ transitionShow, setTransitionShow ] = useState(false)

	const { setMounted } = useMountOverlay({
		component: 'MainMenu',
		onCloseRequested: () => setTransitionShow(false), // start transition out
	})

	const handleRest = () => {
		if (transitionShow) return 
		setMounted(false) // unmount when transitioned out
	}

	const animation = useSpring({
		opacity: transitionShow ? 1 : 0,
		onRest: handleRest, // called when transition is rested
	})

	useEffect(() => setTransitionShow(true), []) // start transition after mount.

	return (
		<animated.div style={animation}>
			main menu
			<button
				onClick={() => setTransitionShow(false)}
				type="button"
			>
				close
			</button>
		</animated.div>
	)
}
```

### Unmount all
You can unmount all overlays by calling the `unmountAll` function returned from `useMountOverlay`.
This is useful for instances such as route updates (so that the overlay doesn't persist to the new
page).

```
const { unmountAll } = useMountOverlay()
const handleRouteUpdate = () => unmountAll()
```
