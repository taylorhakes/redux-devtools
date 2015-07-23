'use strict';

var connections = {};
var cache = [];

chrome.runtime.onConnect.addListener(function (port) {

	function extensionListener(message) {
		// The original connection event doesn't include the tab ID of the
		// DevTools page, so we need to send it explicitly.
		if (message.name == 'init') {
			connections[message.tabId] = port;
		}
	}

	// Listen to messages sent from the DevTools page
	port.onMessage.addListener(extensionListener);

	port.onDisconnect.addListener(function (port) {
		port.onMessage.removeListener(extensionListener);

		Object.keys(connections).forEach(function (id) {
			if (connections[id] == port) {
				delete connections[id];
			}
		})
	})
});

// Receive message from content script and relay to the devTools page for the
// current tab
chrome.runtime.onMessage.addListener(function (request, sender) {

	// Messages from content scripts should have sender.tab set
	if (sender.tab) {
		var tabId = sender.tab.id;
		if (tabId in connections) {
			connections[ tabId ].postMessage(request);
		} else {
			// If the tab isn't in the connection list then that means that the
			// devtool hasn't been opened yet. So lets just cache them.
			cache.push(function () {
				connections[ tabId ].postMessage(request);
			})
		}
	}
	return true;
});
