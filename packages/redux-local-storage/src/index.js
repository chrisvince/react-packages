const initialize = (options = {}) => {
	const {
		localStorageKey = 'state',
		stateToPersist: getStateToPersist = () => {},
	} = options

	const loadState = () => {
		try {
			const serializedState = localStorage.getItem(localStorageKey)
			if (!serializedState) {
				return undefined
			}
			const state = JSON.parse(serializedState)
			return state
		} catch (error) {
			return undefined
		}
	}

	const saveState = state => {
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

export default initialize
