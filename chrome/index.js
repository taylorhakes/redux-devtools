chrome.devtools.panels.create(
	'Redux', null, 'views/devpanel.html', function(panel) {
		panel.onShown.addListener(mainPanelShown);
	}
);