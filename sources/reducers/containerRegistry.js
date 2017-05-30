import { CONTAINER_SET, CONTAINER_UNSET } from '@cideditor/cid/actions';

import { TermElement }                    from '@manaflair/mylittledom/term';

import Immutable                          from 'immutable';

export let ContainerEntry = new Immutable.Record({

    id: null,

    element: null,

    viewId: null,

});

export let ContainerRegistry = new Immutable.Record({

    autoIncrement: 1,

    // id -> ContainerEntry
    entriesById: new Immutable.Map(),

});

export class ContainerRegistryPublicInterface {

    constructor(containerRegistry = new ContainerRegistry()) {

        this.containerRegistry = containerRegistry;

    }

    get autoIncrement() {

        return this.containerRegistry.autoIncrement;

    }

    idSeq() {

        return this.containerRegistry.entriesById.keySeq();

    }

    containerSeq() {

        return this.containerRegistry.entriesById.valueSeq();

    }

    getById(containerId) {

        if (containerId === null)
            return null;

        let instance = this.containerRegistry.entriesById.get(containerId);

        if (!instance)
            return null;

        return instance;

    }

    setContainer(container) {

        let containerRegistry = this.containerRegistry.setIn([ `entriesById`, container.id ], container);

        if (container.id >= containerRegistry.autoIncrement)
            containerRegistry = containerRegistry.merge({ autoIncrement: container.id + 1 });

        return this.applyRegistry(containerRegistry);

    }

    unsetContainer(containerId) {

        let containerRegistry = this.containerRegistry.deleteIn([ `entriesById`, containerId ]);

        return this.applyRegistry(containerRegistry);

    }

    applyRegistry(containerRegistry) {

        if (containerRegistry !== this.containerRegistry) {
            return new ContainerRegistryPublicInterface(containerRegistry);
        } else {
            return this;
        }

    }

}

export function containerRegistry(state = new ContainerRegistryPublicInterface(), action) {

    switch (action.type) {

        default: {
            return state;
        } break;

        case CONTAINER_SET: {
            return state.setContainer(action.container);
        } break;

        case CONTAINER_UNSET: {
            return state.unsetContainer(action.containerId);
        } break;

    }

}
