import { assocPath, mergeDeepRight, path } from 'ramda'

const stateLocalStorage = (options = {}) => {
	const {
		localStorageKey = 'state',
		select = [],
	} = options

	const getStateToPersist = state => select.reduce((acc, rule) => {
		const pathList = rule.split('.').map(x => x.trim())
		const value = path(pathList, state)
		return assocPath(pathList, value, acc)
	}, {})

	const loadState = (defaultState = {}) => {
		try {
			const serializedState = localStorage.getItem(localStorageKey)
			if (!serializedState) {
				return defaultState
			}
			const state = JSON.parse(serializedState)
			return mergeDeepRight(defaultState, state)
		} catch (error) {
			return defaultState
		}
	}

	const saveState = (state = {}) => {
		const stateToPersist = getStateToPersist(state)

		if (!stateToPersist) {
			return
		}

		try {
			const serializedState = JSON.stringify(stateToPersist)
			localStorage.setItem(localStorageKey, serializedState)
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error('There was an error persisting the state to local storage.')
		}
	}

	return {
		loadState,
		saveState,
	}
}

export default stateLocalStorage
