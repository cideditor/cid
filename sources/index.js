import { containerSet, viewSet, windowSet } from '@cideditor/cid/actions';
import { windowSetActive }                  from '@cideditor/cid/actions';
import { viewOpenDescriptor }               from '@cideditor/cid/actions';
import { ContainerEntry }                   from '@cideditor/cid/reducers/containerRegistry';
import { ViewEntry }                        from '@cideditor/cid/reducers/viewRegistry';
import { WINDOW_TYPE }                      from '@cideditor/cid/reducers/windowRegistry';
import { WindowEntry }                      from '@cideditor/cid/reducers/windowRegistry';
import { setupAction }                      from '@cideditor/cid/utils/setupAction';

import { UsageError }                       from '@manaflair/concierge';
import { concierge, flags }                 from '@manaflair/concierge';
import { TermElement }                      from '@manaflair/mylittledom/term';

import { put }                              from 'redux-saga/effects';
import TextBuffer                           from 'text-buffer';

concierge
    .topLevel(`[--no-output] [--debug-console] [--debug-shortcuts] [--debug-paint-rects]`);

concierge
    .command(`open <path>`)
    .flag(flags.DEFAULT_COMMAND)

    .action(setupAction(env => function * () {

        yield put([

            viewSet(new ViewEntry({
                id: 1,
                descriptor: env.path,
            })),

            containerSet(new ContainerEntry({
                id: 1,
                element: new TermElement(),
                viewId: 1,
            })),

            windowSet(new WindowEntry({
                id: 1,
                type: WINDOW_TYPE.VIEW,
                containerId: 1,
            })),

            viewOpenDescriptor.async(
                1,
                env.path,
            ),

            windowSetActive(
                1
            ),

        ]);

    }, { ui: true }));

concierge
    .run(process.argv0, process.argv.slice(2));
