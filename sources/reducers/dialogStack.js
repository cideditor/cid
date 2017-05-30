import { DIALOG_OPEN, DIALOG_CLOSE } from '@cideditor/cid/actions';

import Immutable                     from 'immutable';

export function dialogStack(state = new Immutable.Stack(), action) {

    switch (action.type) {

        case DIALOG_OPEN: {
            return state.unshift(action.component);
        } break;

        case DIALOG_CLOSE: {
            return state.pop();
        } break;

        default: {
            return state;
        } break;

    }

}
