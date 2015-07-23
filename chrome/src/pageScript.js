(function() {
	var TIMEOUT = 30000;
	var ACTION = 'ACTION';
	var UPDATE = 'UPDATE';

	function check(time) {
		if (time > TIMEOUT) {
			return
		}

		if (window.__redux__) {
			registerRedux(window.__redux__);
		} else {
			setTimeout(function () {
				check(time * 2)
			}, time)
		}
	}

	function registerRedux(store) {
		function onChange() {
			window.postMessage({
				payload: store.devToolsStore.getState(),
				source: 'redux-page'
			}, '*')
		}

		function onMessage(event) {
			var message;

			if (event && event.source !== window) {
				return
			}

			message = event.data;

			if (!message || message.source !== 'redux-cs') {
				return;
			}

			if (message.type === ACTION) {
				store.devToolsStore.dispatch(message.payload);
			}

			if (message.type === UPDATE) {
				onChange();
			}
		}

		store.devToolsStore.subscribe(onChange);
		window.addEventListener('message', onMessage);

		onChange();
	}

	check(100);
})();

