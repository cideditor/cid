import { VIEW_OPEN_DESCRIPTOR, containerSet, viewSet } from '@cideditor/cid/actions';
import { EditorView }                                  from '@cideditor/cid/components/views/EditorView';
import { findDriver }                                  from '@cideditor/cid/filesystems';
import { FileViewEntry, DirectoryViewEntry }           from '@cideditor/cid/reducers/viewRegistry';
import { VIEW_STATUS }                                 from '@cideditor/cid/reducers/viewRegistry';
import { ViewEntry }                                   from '@cideditor/cid/reducers/viewRegistry';

import { put, select, takeEvery }                      from 'redux-saga/effects';
import TextBuffer                                      from 'text-buffer';

export function * openManager() {

    yield takeEvery(VIEW_OPEN_DESCRIPTOR, function * (action) {

        let view = yield select(state => state.viewRegistry.getById(action.viewId));

        if (!view) {
            yield put(viewSet(view = new ViewEntry({ id: 0 })));
        } else {
            yield put(viewSet(view = view.merge({ version: view.version + 1 })));
        }

        let currentVersion = view.version;

        try {

            let driver = findDriver(action.descriptor);

            if (!driver)
                throw new Error(`Unsupported protocol`);

            yield put(viewSet(view = view.merge({ status: VIEW_STATUS.LOADING })));

            // ---

            let name = yield driver.getName(action.descriptor);
            let stat = yield driver.getStat(action.descriptor, { followLinks: true });

            view = yield select(state => state.viewRegistry.getById(action.viewId));

            if (!view || view.version !== currentVersion)
                return;

            let { prepareView, loadExtraData } = getViewTools(driver, action.descriptor, stat);

            yield put(viewSet(view = prepareView(view.merge({ name, descriptor: action.descriptor, error: null }))));

            // ---

            let extraData = yield loadExtraData();

            view = yield select(state => state.viewRegistry.getById(action.viewId));

            if (!view || view.version !== currentVersion)
                return;

            yield put(viewSet(view = view.merge({ ... extraData, status: VIEW_STATUS.READY })));

        } catch (error) {

            view = yield select(state => state.viewRegistry.getById(action.viewId));

            if (!view || view.version !== currentVersion)
                return;

            yield put(viewSet(view = view.merge({ status: VIEW_STATUS.ERROR, error })));

        }

    });

}

function getViewTools(driver, descriptor, stat) {

    switch (true) {

        case stat.isDirectory(): {

            let prepareView = view => new DirectoryViewEntry({ ... view.toJS(), component: <DiredView /> });
            let loadExtraData = async () => ({ entries: await driver.readDirectory(descriptor) });

            return { prepareView, loadExtraData };

        } break;

        case stat.isFile(): {

            let prepareView = view => new FileViewEntry({ ... view.toJS(), component: <EditorView />, grammar: `Javascript`, theme: `Tron` });
            let loadExtraData = async () => ({ textBuffer: new TextBuffer((await driver.readFile(descriptor)).toString()) });

            return { prepareView, loadExtraData };

        } break;

        default: {

            throw new Error(`Referenced entry is neither a file nor a directory`);

        } break;

    }

}
