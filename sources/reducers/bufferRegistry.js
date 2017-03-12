import { readFileSync } from 'fs';
import TextBuffer       from 'text-buffer';

export class BufferEntry extends new Immutable.Record({

    id: null,

    path: null,

    grammar: null,
    theme: null,

    textBuffer: null

}) {}

export class BufferRegistry extends new Immutable.Record({

    entries: new Immutable.Map()

}) {

    constructor({ entries = new Immutable.Map([

        [ 0, new BufferEntry({ grammar: `Javascript`, theme: `Tron`, textBuffer: new TextBuffer(readFileSync(__filename).toString()) }) ]

    ]), autoIncrement = entries.size, ... rest } = {}) {

        super({ entries, autoIncrement, ... rest });

    }

}

export function bufferRegistry(state = new BufferRegistry(), action) {

    switch (action.type) {

        default: {
            return state;
        } break;

    }

}
