import * as actions    from '@cideditor/cid/actions';
import { WindowEntry } from '@cideditor/cid/reducers/windowRegistry';

export let windowShortcuts = {

    [`ctrl-x /`]: ({ windowId, dispatch }) => {

        dispatch(actions.windowSplit(windowId, { splitType: WindowEntry.WINDOW_TYPE_COLUMN }));

    },

    [`ctrl-x :`]: ({ windowId, dispatch }) => {

        dispatch(actions.windowSplit(windowId, { splitType: WindowEntry.WINDOW_TYPE_ROW }));

    },

    [`ctrl-x 0`]: ({ windowId, dispatch }) => {

        dispatch(actions.windowKill(windowId));

    },

    [`alt-left`]: ({ windowId, dispatch }) => {

        dispatch(actions.windowMoveActive(windowId, { direction: actions.WINDOW_MOVE_ACTIVE_LEFT }));

    },

    [`alt-right`]: ({ windowId, dispatch }) => {

        dispatch(actions.windowMoveActive(windowId, { direction: actions.WINDOW_MOVE_ACTIVE_RIGHT }));

    },

    [`alt-up`]: ({ windowId, dispatch }) => {

        dispatch(actions.windowMoveActive(windowId, { direction: actions.WINDOW_MOVE_ACTIVE_UP }));

    },

    [`alt-down`]: ({ windowId, dispatch }) => {

        dispatch(actions.windowMoveActive(windowId, { direction: actions.WINDOW_MOVE_ACTIVE_DOWN }));

    }

};
