export default function createDevToolsStore(onDispatch) {
	var currentState = {
		committedState: {},
		stagedActions: [],
		computedStates: [],
		skippedActions: {},
		currentStateIndex: 0
	};
	var listeners = [];

	function dispatch(action) {
		onDispatch(action);
		return action;
	}

	function getState() {
		return currentState;
	}

	function setState(state) {
		currentState = state;
		listeners.forEach(listener => listener());
	}

	function subscribe(listener) {
		listeners.push(listener);

		return function unsubscribe() {
			const index = listeners.indexOf(listener);
			listeners.splice(index, 1);
		};
	}

	return {
		devToolsStore: {
			dispatch,
			getState,
			setState,
			subscribe
		}
	};
}
