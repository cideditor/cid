import { readdirSync, statSync }   from 'fs';
import { basename, extname, join } from 'path';
import { spawn }                   from 'redux-saga/effects';

export function buildSaga(path) {

    let stat = statSync(path);

    if (stat.isFile()) {

        let extension = extname(path);

        if (extension !== `.js`)
            throw new Error(`Failed to execute "buildSaga": Invalid file extension.`);

        let name = basename(path, extension);
        let syms = require(path);

        if (typeof syms[name] !== `function`)
            throw new Error(`Failed to execute "buildSaga": Expected "${name}" to export a function.`);

        return syms[name];

    } else if (stat.isDirectory()) {

        let subs = readdirSync(path).map(entry => {
            return buildSaga(join(path, entry));
        });

        return function * () {

            yield subs.map(sub => {
                return spawn(sub);
            });

        };

    } else {

        throw new Error(`Failed to execute "buildSaga": Invalid entry type.`);

    }

}
