import { CHANGE_TODO } from '../constants/ActionTypes';


export default function localText(state = '', action) {
	switch (action.type) {
		case CHANGE_TODO:
			return action.text;
		default:
			return state;
	}
}

