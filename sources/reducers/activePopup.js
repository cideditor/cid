import { POPUP_OPEN, POPUP_CLOSE } from '@cideditor/cid/actions';

export function activePopup(state = null, action) {

    switch (action.type) {

        case POPUP_OPEN: {
            return action.component;
        } break;

        case POPUP_CLOSE: {
            return null;
        } break;

        default: {
            return state;
        } break;

    }

}
