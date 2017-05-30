import { WINDOW_SET, WINDOW_UNSET } from '@cideditor/cid/actions';

import Immutable                    from 'immutable';

export let WINDOW_TYPE = {

    VIEW: `WINDOW_TYPE_VIEW`,
    COLUMN: `WINDOW_TYPE_COLUMN`,
    ROW: `WINDOW_TYPE_ROW`,

};

export let WindowEntry = new Immutable.Record({

    id: null,

    type: null,

    containerId: null,

    parentId: null,
    childrenIds: null,

});

export let WindowRegistry = new Immutable.Record({

    autoIncrement: 1,

    // id -> WindowEntry
    entriesById: new Immutable.Map(),

    // containerId -> id
    entriesByContainerId: new Immutable.Map(),

});

export class WindowRegistryPublicInterface {

    constructor(windowRegistry = new WindowRegistry()) {

        this.windowRegistry = windowRegistry;

    }

    get autoIncrement() {

        return this.windowRegistry.autoIncrement;

    }

    idSeq() {

        return this.windowRegistry.entriesById.keySeq();

    }

    windowSeq() {

        return this.windowRegistry.entriesById.valueSeq();

    }

    getById(windowId) {

        if (windowId === null)
            return null;

        let instance = this.windowRegistry.entriesById.get(windowId);

        if (!instance)
            return null;

        return instance;

    }

    getByContainerId(containerId) {

        if (containerId === null)
            return null;

        let id = this.windowRegistry.entriesByContainerId.get(containerId);

        if (!id)
            return null;

        return this.getById(id);

    }

    setWindow(window) {

        let oldWindow = this.windowRegistry.getIn([ `entriesById`, window.id ], null);

        if (window.containerId !== null && this.windowRegistry.getIn([ `entriesByContainerId`, window.containerId ], window.id) !== window.id)
            throw new Error(`A same container cannot be used accross multiple windows`);

        let windowRegistry = this.windowRegistry.setIn([ `entriesById`, window.id ], window);

        if (oldWindow && oldWindow.containerId !== window.containerId && oldWindow.containerId !== null)
            windowRegistry = windowRegistry.deleteIn([ `entriesByContainerId`, oldWindow.containerId ]);

        if (window.containerId !== null)
            windowRegistry = windowRegistry.setIn([ `entriesByContainerId`, window.containerId ], window.id);

        if (window.id >= windowRegistry.autoIncrement)
            windowRegistry = windowRegistry.merge({ autoIncrement: window.id + 1 });

        return this.applyRegistry(windowRegistry);

    }

    unsetWindow(windowId) {

        let window = this.windowRegistry.getIn([ `entriesById`, windowId ], null);

        if (!window)
            return this;

        let windowRegistry = this.windowRegistry.deleteIn([ `entriesById`, windowId ]);

        if (window.containerId)
            windowRegistry = windowRegistry.deleteIn([ `entriesByContainerId`, window.containerId ]);

        return this.applyRegistry(windowRegistry);

    }

    applyRegistry(windowRegistry) {

        if (windowRegistry !== this.windowRegistry) {
            return new WindowRegistryPublicInterface(windowRegistry);
        } else {
            return this;
        }

    }

}

export function windowRegistry(state = new WindowRegistryPublicInterface(), action) {

    switch (action.type) {

        default: {
            return state;
        } break;

        case WINDOW_SET: {
            return state.setWindow(action.window);
        } break;

        case WINDOW_UNSET: {
            return state.unsetWindow(action.windowId);
        } break;

    }

}
