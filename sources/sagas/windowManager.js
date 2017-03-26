import { WINDOW_MOVE_ACTIVE_LEFT, WINDOW_MOVE_ACTIVE_RIGHT, WINDOW_MOVE_ACTIVE_UP, WINDOW_MOVE_ACTIVE_DOWN } from '@cideditor/cid/actions';
import { WINDOW_SPLIT, WINDOW_KILL, WINDOW_MOVE_ACTIVE }                                                     from '@cideditor/cid/actions';
import { viewSet, windowSet, windowSetActive, windowUnset }                                                  from '@cideditor/cid/actions';
import { ViewEntry }                                                                                         from '@cideditor/cid/reducers/viewRegistry';
import { WindowEntry }                                                                                       from '@cideditor/cid/reducers/windowRegistry';
import { atomicBatch }                                                                                       from '@cideditor/cid/utils/atomicBatch';

import { put, select, takeEvery }                                                                            from 'redux-saga/effects';

export function * windowManager() {

    yield [

        takeEvery(WINDOW_SPLIT, splitWindow),
        takeEvery(WINDOW_KILL, killWindow),
        takeEvery(WINDOW_MOVE_ACTIVE, moveActiveWindow)

    ];

}

function * splitWindow(action) {

    let window = yield select(state => {
        return state.windowRegistry.getById(action.windowId);
    });

    if (!window || window.type !== WindowEntry.WINDOW_TYPE_VIEW)
        return;

    let view = yield select(state => {
        return state.viewRegistry.getById(window.viewId);
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
            parentId: window.id,
            viewId: window.viewId
        });

        let secondNewWindow = new WindowEntry({
            id: autoIncrementWindow++,
            type: WindowEntry.WINDOW_TYPE_VIEW,
            parentId: window.id,
            viewId: newView.id
        });

        let updatedWindow = window.merge({
            type: action.splitType,
            viewId: null,
            childrenIds: new Immutable.List([ firstNewWindow.id, secondNewWindow.id ])
        });

        yield put(viewSet(newView));

        yield put(windowSet(firstNewWindow));
        yield put(windowSet(secondNewWindow));
        yield put(windowSet(updatedWindow));

        yield put(windowSetActive(firstNewWindow.id));

    });

}

function * killWindow(action) {

    let window = yield select(state => {
        return state.windowRegistry.getById(action.windowId);
    });

    if (!window || window.type !== WindowEntry.WINDOW_TYPE_VIEW || window.parentId === null)
        return;

    let parent = yield select(state => {
        return state.windowRegistry.getById(window.parentId);
    });

    let sibling = yield select(state => {
        return state.windowRegistry.getById(parent.childrenIds.find(id => id !== window.id));
    });

    yield * atomicBatch(function * () {

        yield put(windowSet(sibling.merge({ id: parent.id, parentId: parent.parentId })));

        yield put(windowUnset(parent.childrenIds.get(0)));
        yield put(windowUnset(parent.childrenIds.get(1)));

        yield put(windowSetActive(parent.id));

    });

}

function * moveActiveWindow(action) {

    let checkParent;
    let getSiblingId;

    switch (action.direction) {

        case WINDOW_MOVE_ACTIVE_LEFT: {
            checkParent = (parent, child) => parent.type === WindowEntry.WINDOW_TYPE_ROW && parent.childrenIds.indexOf(child.id) !== 0;
            getSiblingId = (parent, child) => parent.childrenIds.get(parent.childrenIds.indexOf(child.id) - 1);
        } break;

        case WINDOW_MOVE_ACTIVE_RIGHT: {
            checkParent = (parent, child) => parent.type === WindowEntry.WINDOW_TYPE_ROW && parent.childrenIds.indexOf(child.id) !== parent.childrenIds.size - 1;
            getSiblingId = (parent, child) => parent.childrenIds.get(parent.childrenIds.indexOf(child.id) + 1);
        } break;

        case WINDOW_MOVE_ACTIVE_UP: {
            checkParent = (parent, child) => parent.type === WindowEntry.WINDOW_TYPE_COLUMN && parent.childrenIds.indexOf(child.id) !== 0;
            getSiblingId = (parent, child) => parent.childrenIds.get(parent.childrenIds.indexOf(child.id) - 1);
        } break;

        case WINDOW_MOVE_ACTIVE_DOWN: {
            checkParent = (parent, child) => parent.type === WindowEntry.WINDOW_TYPE_COLUMN && parent.childrenIds.indexOf(child.id) !== parent.childrenIds.size - 1;
            getSiblingId = (parent, child) => parent.childrenIds.get(parent.childrenIds.indexOf(child.id) + 1);
        } break;

    }

    let child = yield select(state => {
        return state.windowRegistry.getById(action.windowId);
    });

    let parent = child.parentId !== null ? yield select(state => {
        return state.windowRegistry.getById(child.parentId);
    }) : null;

    while (parent && !checkParent(parent, child)) {
        child = parent; parent = select.parentId !== null ? yield select(state => {
            return state.windowRegistry.getById(child.parentId);
        }) : null;
    }

    if (parent) {
        yield put(windowSetActive(getSiblingId(parent, child)));
    }

}
