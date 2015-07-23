var ACTION = 'ACTION';
var UPDATE = 'UPDATE';

window.addEventListener('beforeunload', onUnload);
window.addEventListener('message', onMessageFromPage);

var script = document.createElement('script');
script.type = 'text/javascript';
script.src = chrome.extension.getURL('src/pageScript.js');
script.onload = function onuload() {
	script.parentNode.removeChild(script);
};
document.documentElement.appendChild(script);

function onUnload() {
	chrome.runtime.sendMessage({
		type: 'PAGE_UNLOADED'
	})
}

// Communicate with the devtool
function onMessageFromPage(event) {
	if (event && event.source !== window) {
		return;
	}

	var message = event.data;

	if (typeof message !== 'object' || message === null || message.source !== 'redux-page') {
		return;
	}

	chrome.runtime.sendMessage(message);
}

// Send actions to the page
function dispatch(action) {
	window.postMessage({
		type: ACTION,
		payload: action,
		source: 'redux-cs'
	}, '*')
}

// Ask for updates from the page
function update() {
	window.postMessage({
		type: UPDATE,
		source: 'redux-cs'
	}, '*')
}
