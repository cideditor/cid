import { VIEW_SET }    from '@cideditor/cid/actions';
import { EditorView }  from '@cideditor/cid/components/views/EditorView';

import { TermElement } from '@manaflair/mylittledom/term';

export class ViewEntry extends new Immutable.Record({

    id: null,

    container: null,

    component: null

}) {

    constructor({ container = new TermElement(), ... rest }) {

        super({ container, ... rest });

    }

}

export class ViewRegistry extends new Immutable.Record({

    autoIncrement: 0,

    entries: new Immutable.Map()

}) {

    constructor({ entries = new Immutable.Map([

        [ 0, new ViewEntry({ id: 0, component: <EditorView bufferId={0} /> }) ]

    ]), autoIncrement = entries.size, ... rest } = {}) {

        super({ entries, autoIncrement, ... rest });

    }

    getById(viewId) {

        if (viewId === null)
            return null;

        return this.entries.get(viewId);

    }

}

export function viewRegistry(state = new ViewRegistry(), action) {

    switch (action.type) {

        case VIEW_SET: {
            return setView(state, action);
        } break;

        default: {
            return state;
        } break;

    }

}

function setView(state, action) {

    state = state.updateIn([ `autoIncrement` ], autoIncrement => {
        return Math.max(autoIncrement, action.view.id + 1)
    });

    state = state.updateIn([ `entries`, action.view.id ], (view = action.view) => {
        return view.merge(action.view);
    });

    return state;

}
