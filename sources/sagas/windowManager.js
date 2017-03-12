import { WINDOW_SPLIT, WINDOW_KILL }                        from '@cideditor/cid/actions';
import { viewSet, windowSet, windowSetActive, windowUnset } from '@cideditor/cid/actions';
import { ViewEntry }                                        from '@cideditor/cid/reducers/viewRegistry';
import { WindowEntry }                                      from '@cideditor/cid/reducers/windowRegistry';
import { atomicBatch }                                      from '@cideditor/cid/utils/atomicBatch';

import { put, select, takeEvery }                           from 'redux-saga/effects';

export function * windowManager() {

    yield [

        takeEvery(WINDOW_SPLIT, splitWindow),
        takeEvery(WINDOW_KILL, killWindow)

    ];

}

function * splitWindow(action) {

    let window = yield select(state => {
        return state.windowRegistry.entries.get(action.windowId);
    });

    if (!window || window.type !== WindowEntry.WINDOW_TYPE_VIEW)
        return;

    let view = yield select(state => {
        return state.viewRegistry.entries.get(window.viewId);
    });

    yield * atomicBatch(function * () {

        let autoIncrementView = yield select(state => {
            return state.viewRegistry.autoIncrement;
        });

        let autoIncrementWindow = yield select(state => {
            return state.windowRegistry.autoIncrement;
        });

        let newView = new ViewEntry({
            id: autoIncrementView++,
            component: view.component
        });

        let firstNewWindow = new WindowEntry({
            id: autoIncrementWindow++,
            type: WindowEntry.WINDOW_TYPE_VIEW,
            viewId: window.viewId
        });

        let secondNewWindow = new WindowEntry({
            id: autoIncrementWindow++,
            type: WindowEntry.WINDOW_TYPE_VIEW,
            viewId: newView.id
        });

        let updatedWindow = new WindowEntry({
            id: window.id,
            type: action.splitType,
            childrenIds: new Immutable.List([ firstNewWindow.id, secondNewWindow.id ])
        });

        yield put(viewSet(newView));

        yield put(windowSet(firstNewWindow));
        yield put(windowSet(secondNewWindow));
        yield put(windowSet(updatedWindow));

        yield put(windowSetActive(secondNewWindow.id));

    });

}

function * killWindow(action) {

    if (action.windowId === 0)
        return;

    let window = yield select(state => {
        return state.windowRegistry.entries.get(action.windowId);
    });

    if (!window || window.type !== WindowEntry.WINDOW_TYPE_VIEW)
        return;

    let parent = yield select(state => {
        return state.windowRegistry.entries.find(other => other.childrenIds && other.childrenIds.includes(window.id));
    });

    let sibling = yield select(state => {
        return state.windowRegistry.entries.get(parent.childrenIds.find(id => id !== window.id));
    });

    yield * atomicBatch(function * () {

        yield put(windowSet(sibling.merge({ id: parent.id })));

        yield put(windowUnset(parent.childrenIds.get(0)));
        yield put(windowUnset(parent.childrenIds.get(1)));

        yield put(windowSetActive(parent.id));

    });

}
