import { REFRESH_THEME_LIST } from '@cideditor/cid/actions';

import { glob }               from 'glob';
import { basename }           from 'path';

function getThemeList() {

    return Immutable.List(glob.sync(`**/*.tmTheme`, {
        cwd: `${__dirname}/../themes`
    })).map(theme => basename(theme, `.tmTheme`));

}

export function themeList(state = getThemeList(), action) {

    switch (action.type) {

        case REFRESH_THEME_LIST: {
            return getThemeList();
        } break;

        default: {
            return state;
        } break;

    }

}
