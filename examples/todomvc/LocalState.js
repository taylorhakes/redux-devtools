import React, { Component, PropTypes } from 'react';
import combineReducers from 'redux/lib/utils/combineReducers';

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
			defaultState: this.props.getInitialState ? this.props.getInitialState(this.props) : undefined,
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
			type: '@@local',
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
	var stateLocal = {},
		stateSubscribers = {};

	function subscribe({ key, reducers, onChange, defaultState }) {
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
		stateLocal[key] = typeof defaultState !== 'undefined' ? defaultState : stateSubscribers[key].reducer(undefined, { type: '@@localInit' });

		return unsubscribe.bind(null, key, onChange);
	}

	function newReducer(reducer) {
		return (state, action) => {
			var state = reducer(state, action);
			if (action.type === '@@local') {
				if (stateSubscribers[ action.key ]) {
					stateLocal[action.key] = stateSubscribers[ action.key ].reducer(stateLocal[action.key], action.data);
					stateSubscribers[ action.key ].subscribers.forEach((fn) => fn());
				}
			}
			state.__local = stateLocal;
			return state;
		}
	}

	function unsubscribe(key, onChange) {
		if (stateSubscribers[key].subscribers.length === 1) {
			delete stateSubscribers[key];
			delete stateLocal[key];
			return;
		}

		stateSubscribers[key].subscribers = stateSubscribers[key].subscribers.filter((fn) => fn !== onChange);
	}

	function getState(key) {
		return stateLocal[key];
	}



	return function(reducer, initialState) {
		const store = next(newReducer(reducer), initialState);

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
