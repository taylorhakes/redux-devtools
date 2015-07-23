Redux DevTools Chrome Extension
=========================

A better README is coming

<img src='http://i.imgur.com/jvTykuO.png' width='700'>

### Using Extension

##### Setup your app


```js
const finalCreateStore = compose(
  applyMiddleware(thunk),
  
  // Same as standard Dev tools
  devTools(),
  persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/)),
  createStore
);

const reducer = combineReducers(reducers);
const store = finalCreateStore(reducer);

// Needed for extension. Expose store at window.__redux__ (2 underscores)
window.__redux__ = store;
```


##### Installing the extension:

```
git clone https://github.com/gaearon/redux-devtools.git
cd redux-devtools/chrome
npm install
npm build
open chrome://extensions/ in Google Chrome
Click checkbox Developer Mode
Click Load unpacked extension
Select redux-devtools/chrome folder
Open app with redux
```



### License

MIT
