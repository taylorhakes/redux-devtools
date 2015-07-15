import { DevTools, DebugPanel, LogMonitor } from 'redux-devtools/lib/react';
import React from 'react';

React.render(
	<DevTools store={store}
			  monitor={LogMonitor} />,
	document.getElementById('root')
);

