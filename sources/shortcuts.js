import * as actions           from '@cideditor/cid/actions';
import { WINDOW_TYPE }        from '@cideditor/cid/reducers/windowRegistry';
import { FileSelectorDialog } from '@cideditor/cid/components/dialogs/FileSelectorDialog';

import { put, select }        from 'redux-saga/effects';

export let windowShortcuts = {

    [`ctrl-x /`]: ({ windowId, dispatch }) => {

        dispatch(actions.windowSplit(windowId, { splitType: WINDOW_TYPE.COLUMN }));

    },

    [`ctrl-x :`]: ({ windowId, dispatch }) => {

        dispatch(actions.windowSplit(windowId, { splitType: WINDOW_TYPE.ROW }));

    },

    [`ctrl-x 0`]: ({ windowId, dispatch }) => {

        dispatch(actions.windowKill(windowId));

    },

    [`ctrl-o`]: ({ dispatch, getState }) => {

        dispatch(function * () {

            let path = yield select(state => state.activePath);

            dispatch(actions.dialogOpen(<FileSelectorDialog initialPath={path} />));

        });

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
