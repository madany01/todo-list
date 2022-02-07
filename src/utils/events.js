function createEvent () {
	const listeners = new Set()

	function addListener (listener) {
		listeners.add(listener)
	}

	function removeListener (listener) {
		listeners.removeListener(listener)
	}

	function trigger (...args) {
		listeners.forEach(listener => listener(...args))
	}

	return {
		addListener,
		removeListener,
		trigger,
	}
}

export {
	createEvent
}
