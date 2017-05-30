import { PATH_SET_ACTIVE } from '@cideditor/cid/actions';

export function activePath(state = null, action) {

    switch (action.type) {

        case PATH_SET_ACTIVE: {
            return action.path;
        } break;

        default: {
            return state;
        } break;

    }

}
