import { WINDOW_SET, WINDOW_UNSET } from '@cideditor/cid/actions';

export class WindowEntry extends new Immutable.Record({

    id: null,

    type: null,

    viewId: null,

    parentId: null,
    childrenIds: null

}) {

    static WINDOW_TYPE_VIEW = `WINDOW_TYPE_VIEW`;

    static WINDOW_TYPE_COLUMN = `WINDOW_TYPE_COLUMN`;

    static WINDOW_TYPE_ROW = `WINDOW_TYPE_ROW`;

}

export class WindowRegistry extends new Immutable.Record({

    autoIncrement: 0,

    entries: new Immutable.Map()

}) {

    constructor({ entries = new Immutable.Map([

        [ 0, new WindowEntry({ id: 0, type: WindowEntry.WINDOW_TYPE_VIEW, viewId: 0 }) ]

    ]), autoIncrement = entries.size, ... rest } = {}) {

        super({ entries, autoIncrement, ... rest });

    }

    getById(windowId) {

        if (windowId === null)
            return null;

        return this.entries.get(windowId);

    }

    getByViewId(viewId) {

        if (viewId === null)
            return null;

        return this.entries.find(window => {

            if (window.type !== WindowEntry.WINDOW_TYPE_VIEW)
                return false;

            if (window.viewId !== viewId)
                return false;

            return true;

        });

    }

}

export function windowRegistry(state = new WindowRegistry(), action) {

    switch (action.type) {

        case WINDOW_SET: {
            return setWindow(state, action);
        } break;

        case WINDOW_UNSET: {
            return state.deleteIn([ `entries`, action.windowId ]);
        } break;

        default: {
            return state;
        } break;

    }

}

function setWindow(state, action) {

    state = state.updateIn([ `autoIncrement` ], autoIncrement => {
        return Math.max(autoIncrement, action.window.id + 1);
    });

    state = state.updateIn([ `entries`, action.window.id ], (window = action.window) => {
        return window.merge(action.window);
    });

    return state;

}
