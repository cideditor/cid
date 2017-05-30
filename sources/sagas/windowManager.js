import { WINDOW_MOVE_ACTIVE_LEFT, WINDOW_MOVE_ACTIVE_RIGHT, WINDOW_MOVE_ACTIVE_UP, WINDOW_MOVE_ACTIVE_DOWN } from '@cideditor/cid/actions';
import { WINDOW_SPLIT, WINDOW_KILL, WINDOW_MOVE_ACTIVE }                                                     from '@cideditor/cid/actions';
import { containerSet, containerUnset, viewUnset, windowSet, windowSetActive, windowUnset }                  from '@cideditor/cid/actions';
import { ContainerEntry }                                                                                    from '@cideditor/cid/reducers/containerRegistry';
import { WINDOW_TYPE }                                                                                       from '@cideditor/cid/reducers/windowRegistry';
import { WindowEntry }                                                                                       from '@cideditor/cid/reducers/windowRegistry';
import { atomicBatch }                                                                                       from '@cideditor/cid/utils/atomicBatch';

import { TermElement }                                                                                       from '@manaflair/mylittledom/term';

import { put, select, takeEvery }                                                                            from 'redux-saga/effects';

export function * windowManager() {

    yield [

        takeEvery(WINDOW_SPLIT, splitWindow),
        takeEvery(WINDOW_KILL, killWindow),
        takeEvery(WINDOW_MOVE_ACTIVE, moveActiveWindow),

    ];

}

function * splitWindow(action) {

    let window = yield select(state => {
        return state.windowRegistry.getById(action.windowId);
    });

    if (!window || window.type !== WINDOW_TYPE.VIEW)
        return;

    let container = yield select(state => {
        return state.containerRegistry.getById(window.containerId);
    });

    yield * atomicBatch(function * () {

        let autoIncrementContainer = yield select(state => {
            return state.containerRegistry.autoIncrement;
        });

        let autoIncrementWindow = yield select(state => {
            return state.windowRegistry.autoIncrement;
        });

        let newContainer = new ContainerEntry({
            id: autoIncrementContainer++,
            element: new TermElement(),
            viewId: container.viewId,
        });

        let firstNewWindow = new WindowEntry({
            id: autoIncrementWindow++,
            type: WINDOW_TYPE.VIEW,
            containerId: window.containerId,
            parentId: window.id,
        });

        let secondNewWindow = new WindowEntry({
            id: autoIncrementWindow++,
            type: WINDOW_TYPE.VIEW,
            containerId: newContainer.id,
            parentId: window.id,
        });

        let updatedWindow = new WindowEntry({
            id: window.id,
            type: action.splitType,
            containerId: null,
            parentId: window.parentId,
            childrenIds: new Immutable.List([ firstNewWindow.id, secondNewWindow.id ])
        });

        yield put(containerSet(newContainer));

        yield put(windowSet(updatedWindow));
        yield put(windowSet(firstNewWindow));
        yield put(windowSet(secondNewWindow));

        yield put(windowSetActive(firstNewWindow.id));

    });

}

function * killWindow(action) {

    let window = yield select(state => {
        return state.windowRegistry.getById(action.windowId);
    });

    if (!window || window.type !== WINDOW_TYPE.VIEW || window.parentId === null)
        return;

    let parent = yield select(state => {
        return state.windowRegistry.getById(window.parentId);
    });

    let sibling = yield select(state => {
        return state.windowRegistry.getById(parent.childrenIds.find(id => id !== window.id));
    });

    yield * atomicBatch(function * () {

        yield put(containerUnset(window.containerId));

        yield put(windowUnset(parent.childrenIds.get(0)));
        yield put(windowUnset(parent.childrenIds.get(1)));

        yield put(windowSet(parent.merge({ type: WINDOW_TYPE.VIEW, containerId: sibling.containerId, childrenIds: null })));

        yield put(windowSetActive(parent.id));

    });

}

function * moveActiveWindow(action) {

    let checkParent;
    let getSiblingId;

    switch (action.direction) {

        case WINDOW_MOVE_ACTIVE_LEFT: {
            checkParent = (parent, child) => parent.type === WINDOW_TYPE.ROW && parent.childrenIds.indexOf(child.id) !== 0;
            getSiblingId = (parent, child) => parent.childrenIds.get(parent.childrenIds.indexOf(child.id) - 1);
        } break;

        case WINDOW_MOVE_ACTIVE_RIGHT: {
            checkParent = (parent, child) => parent.type === WINDOW_TYPE.ROW && parent.childrenIds.indexOf(child.id) !== parent.childrenIds.size - 1;
            getSiblingId = (parent, child) => parent.childrenIds.get(parent.childrenIds.indexOf(child.id) + 1);
        } break;

        case WINDOW_MOVE_ACTIVE_UP: {
            checkParent = (parent, child) => parent.type === WINDOW_TYPE.COLUMN && parent.childrenIds.indexOf(child.id) !== 0;
            getSiblingId = (parent, child) => parent.childrenIds.get(parent.childrenIds.indexOf(child.id) - 1);
        } break;

        case WINDOW_MOVE_ACTIVE_DOWN: {
            checkParent = (parent, child) => parent.type === WINDOW_TYPE.COLUMN && parent.childrenIds.indexOf(child.id) !== parent.childrenIds.size - 1;
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
