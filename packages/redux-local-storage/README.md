# @sb-m/redux-local-storage

## Overview
`@sb-m/redux-local-storage` enables Redux state to be persisted in the user's local storage.

## Installation
`npm install @sb-m/redux-local-storage`

## Usage
The package must be initialized. The `stateToPersist` option must be set to determine which state
should be saved to the local storage. The initialization will return two functions: `loadState` and
`saveState`. `loadState` should be called as the `preloadedState` value in redux `configureStore`,
`saveState` should be called in the `subscribe` method of the redux store passing the state using
the `store.getState()` method.
Here's an example:
```
import initializeLocalStorage from '@sb-m/redux-local-storage'

const { loadState, saveState } = initializeLocalStorage({
	localStorageKey: 'localStorageKey',
	stateToPersist: state => ({
		cart: { lineItems: state.cart.lineItems },
		checkout: { id: state.checkout.id },
	}),
})

const store = configureStore({
	reducer,
	preloadedState: loadState(),
})

store.subscribe(() => saveState(store.getState()))
```

## initializeLocalStorage
Initializes the local storage package.
### Parameters
| Parameter         | Type     | Description                                                             |
|:------------------|:---------|-------------------------------------------------------------------------|
| `localStorageKey` | String   | The local storage key for storing the state. Defaults to 'state'        |
| `stateToPersist`  | Function | A function that returns an object mapping the state that should persist |

## loadState
Loads the saved state from local storage.

### Parameters
None

## saveState
Saves the state to local storage. Pass the redux state as the first parameter.
