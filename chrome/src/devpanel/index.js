import createDevStore from './createDevStore';
import { DevTools, LogMonitor } from 'redux-devtools/src/react';
import React from 'react';

// Create a connection to the background page
var backgroundPageConnection = chrome.runtime.connect({
	name: "panel"
});

var store = createDevStore((action) => {
	chrome.devtools.inspectedWindow.eval('dispatch(' + JSON.stringify(action) + ')', {
		useContentScriptContext: true
	});
});

backgroundPageConnection.onMessage.addListener((message) => {
	store.devToolsStore.setState(message.payload);
});

backgroundPageConnection.postMessage({
	name: 'init',
	tabId: chrome.devtools.inspectedWindow.tabId
});


React.render(<DevTools monitor={LogMonitor} store={store}></DevTools>,
	document.getElementById('root')
);


// Get an update from the page on load
chrome.devtools.inspectedWindow.eval('update()', {
	useContentScriptContext: true
});
