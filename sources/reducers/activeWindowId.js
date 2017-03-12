import { WINDOW_SET_ACTIVE } from '@cideditor/cid/actions';

export function activeWindowId(state = 0, action) {

    switch (action.type) {

        case WINDOW_SET_ACTIVE: {
            return action.windowId;
        } break;

        default: {
            return state;
        } break;

    }

}
