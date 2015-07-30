import { EDIT_MODE_TODO } from '../constants/ActionTypes';


export default function editing(state = false, action) {
	switch (action.type) {
		case EDIT_MODE_TODO:
			return action.isEditing;
		default:
			return state;
	}
}

