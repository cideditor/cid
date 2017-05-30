import { VIEW_SET, VIEW_UNSET } from '@cideditor/cid/actions';

import { readFileSync }         from 'fs';
import Immutable                from 'immutable';
import TextBuffer               from 'text-buffer';

export let VIEW_STATUS = {

    LOADING: `VIEW_STATUS.LOADING`,
    ERROR: `VIEW_STATUS.ERROR`,
    READY: `VIEW_STATUS.READY`,

};

export let ViewEntry = new Immutable.Record({

    id: null,

    version: 0,

    name: null,
    descriptor: null,

    status: null,
    error: null,

    component: null,

}, `ViewEntry`);

export let DirectoryViewEntry = new Immutable.Record({

    ... new ViewEntry().toJS(),

    entries: null,

}, `DirectoryViewEntry`);

export let FileViewEntry = new Immutable.Record({

    ... new ViewEntry().toJS(),

    textBuffer: null,

    grammar: null,
    theme: null,

    readOnly: false,

}, `FileViewEntry`);

export let ViewRegistry = new Immutable.Record({

    autoIncrement: 1,

    // id -> ViewEntry
    entriesById: new Immutable.Map(),

    // descriptor -> id
    entriesByDescriptor: new Immutable.Map(),

}, `ViewRegistry`);

export class ViewRegistryPublicInterface {

    constructor(viewRegistry = new ViewRegistry()) {

        this.viewRegistry = viewRegistry;

    }

    get autoIncrement() {

        return this.viewRegistry.autoIncrement;

    }

    createView(Type, props = {}) {

        return new Type({
            id: this.viewRegistry.autoIncrement,
            ... props
        });

    }

    getById(viewId) {

        if (viewId === null)
            return null;

        let instance = this.viewRegistry.entriesById.get(viewId);

        if (!instance)
            return null;

        return instance;

    }

    getByDescriptor(descriptor) {

        if (descriptor === null)
            return null;

        let id = this.viewRegistry.entriesByDescriptor.get(descriptor);

        if (!id)
            return null;

        return this.getById(id);

    }

    setView(view) {

        let oldView = this.viewRegistry.getIn([ `entriesById`, view.id ], null);

        if (oldView && oldView.descriptor !== view.descriptor)
            throw new Error(`A view descriptor cannot be changed during its lifetime`);

        if (view.descriptor !== null && this.viewRegistry.getIn([ `entriesByDescriptor`, view.descriptor ], view.id) !== view.id)
            throw new Error(`A same descriptor cannot be used accross multiple views`);

        let viewRegistry = this.viewRegistry.setIn([ `entriesById`, view.id ], view);

        if (view.id >= viewRegistry.autoIncrement)
            viewRegistry = viewRegistry.merge({ autoIncrement: view.id + 1 });

        if (!oldView && view.descriptor !== null)
            viewRegistry = viewRegistry.setIn([ `entriesByDescriptor`, view.descriptor ], view.id);

        return this.applyRegistry(viewRegistry);

    }

    unsetView(viewId) {

        let oldView = this.viewRegistry.getIn([ `entriesById`, viewId ]);

        if (!oldView)
            return this;

        let viewRegistry = this.viewRegistry.deleteIn([ `entriesById`, viewId ]);

        if (!oldView && oldView.descriptor !== null)
            viewRegistry = viewRegistry.deleteIn([ `entriesByDescriptor`, oldView.descriptor ]);

        return this.applyRegistry(viewRegistry);

    }

    applyRegistry(viewRegistry) {

        if (viewRegistry !== this.viewRegistry) {
            return new ViewRegistryPublicInterface(viewRegistry);
        } else {
            return this;
        }

    }

}

export function viewRegistry(state = new ViewRegistryPublicInterface(), action) {

    switch (action.type) {

        default: {
            return state;
        } break;

        case VIEW_SET: {
            return state.setView(action.view);
        } break;

        case VIEW_UNSET: {
            return state.unsetView(action.viewId);
        } break;

    }

}
