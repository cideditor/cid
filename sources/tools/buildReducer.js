import { readdirSync, statSync }   from 'fs';
import { basename, extname, join } from 'path';
import { combineReducers }         from 'redux';

export function buildReducer(path) {

    let stat = statSync(path);

    if (stat.isFile()) {

        let extension = extname(path);

        if (extension !== `.js`)
            throw new Error(`Failed to execute "buildReducer": Invalid file extension.`);

        let name = basename(path, extension);
        let syms = require(path);

        if (typeof syms[name] !== `function`)
            throw new Error(`Failed to execute "buildReducer": Expected "${name}" to export a function.`);

        return syms[name];

    } else if (stat.isDirectory()) {

        return combineReducers(readdirSync(path).reduce((reducers, entry) => {
            return Object.assign(reducers, { [basename(entry, extname(entry))]: buildReducer(join(path, entry)) });
        }, {}));

    } else {

        throw new Error(`Failed to execute "buildReducer": Invalid entry type.`);

    }

}
