import React, { Component, PropTypes } from 'react';
import combineReducers from 'redux/lib/utils/combineReducers';


const LOCAL = '@@local';
const LOCAL_MOUNT = '@@localMount';
const LOCAL_UNMOUNT = '@@localUnmount';
const LOCAL_INIT = '@@localInit';
const LOCAL_KEY = '__local';

class LocalComponent extends Component {
	static contextTypes = {
		store: PropTypes.shape({
			localState: PropTypes.object
		})
	};

	static propTypes = {
		children: PropTypes.func.isRequired,
		keyFunc: PropTypes.func.isRequired,
		reducers: PropTypes.object.isRequired
	};

	constructor(props, context) {
		super(props, context);
		this.state = this.context.store.localState.getState(this.props.keyFunc(this.props));
	}

	componentDidMount() {
		this.unsubscribe = this.context.store.localState.subscribe({
			key: this.props.keyFunc(this.props),
			reducers: this.props.reducers,
			initialState: this.props.getInitialState ? this.props.getInitialState(this.props) : undefined,
			onChange: ::this.handleChange
		});
		this.handleChange();
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

	handleChange() {
		this.setState(this.context.store.localState.getState(this.props.keyFunc(this.props)));
	}

	dispatchLocal(action) {
		this.context.store.dispatch({
			type: LOCAL,
			key: this.props.keyFunc(this.props),
			data: action
		});
	}

	render() {
		const { children } = this.props;

		return children({ dispatch: ::this.dispatchLocal, ...this.props,  ...this.state });
	}
}

export function local(info) {
	return DecoratedComponent => class LocalDecorator extends Component {
		static displayName = `LocalState(hello)`;
		static DecoratedComponent = DecoratedComponent;

		render() {
			return (
				<LocalComponent {...this.props} {...info}>
					{stuff => <DecoratedComponent  {...this.props} {...stuff} />}
				</LocalComponent>
			);
		}
	};
};




export function localState(next) {
	let stateSubscribers = {},
		store;

	function subscribe({ key, reducers, onChange, initialState }) {
		if (!stateSubscribers[key]) {
			stateSubscribers[key] = {
				reducersObj: {},
				subscribers: [],
				reducer: null
			};
		}

		stateSubscribers[key].subscribers.push(onChange);
		stateSubscribers[key].reducersObj = { ...stateSubscribers[key].reducersObj, ...reducers };
		stateSubscribers[key].reducer = combineReducers(stateSubscribers[key].reducersObj);

		if (!store.getState()[LOCAL_KEY][key]) {
			store.dispatch({ type: LOCAL, subType: LOCAL_MOUNT, state: initialState, key });
		}

		return unsubscribe.bind(null, key, onChange);
	}

	function newReducer(reducer) {
		return (state, action) => {
			let newLocal = (state || {}).__local || {};
			const newState = reducer(state, action);
			if (action.type === LOCAL && stateSubscribers[ action.key ]) {
				newLocal = {...newLocal};
				if (action.subType === LOCAL_MOUNT) {
					newLocal[action.key] = action.state ? action.state : stateSubscribers[action.key].reducer(undefined, { type: LOCAL_INIT });
				} else if (action.subType === LOCAL_UNMOUNT) {
					delete newLocal[action.key];
				} else {
					newLocal[action.key] = stateSubscribers[ action.key ].reducer(newLocal[action.key], action.data);
				}
				setTimeout(() => {
					stateSubscribers[ action.key ].subscribers.forEach((fn) => fn());
				});

			}
			newState[LOCAL_KEY] = newLocal;
			return newState;
		}
	}

	function unsubscribe(key, onChange) {
		if (stateSubscribers[key].subscribers.length === 1) {
			delete stateSubscribers[key];
			store.dispatch({ type: LOCAL, subType: LOCAL_UNMOUNT, key });
			return;
		}

		stateSubscribers[key].subscribers = stateSubscribers[key].subscribers.filter((fn) => fn !== onChange);
	}

	function getState(key) {
		return store.getState()[LOCAL_KEY][key];
	}

	return function(reducer, initialState) {
		store = next(newReducer(reducer), initialState);

		return {
			...store,
			replaceReducer: (reducer) => store.replaceReducer(newReducer(reducer)),
			localState: {
				subscribe,
				unsubscribe,
				getState
			}
		};

	};
}
