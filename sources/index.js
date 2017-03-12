import { Application }                           from '@cideditor/cid/components/Application';
import { buildReducer }                          from '@cideditor/cid/tools/buildReducer';
import { buildSaga }                             from '@cideditor/cid/tools/buildSaga';

import { render }                                from '@manaflair/mylittledom/term/react';
import { TermElement, TermScreen, TermText }     from '@manaflair/mylittledom/term';
import { reduxBatch }                            from '@manaflair/redux-batch';

import { Console }                               from 'console';
import { glob }                                  from 'glob';
import { camelizeKeys }                          from 'humps';
import minimist                                  from 'minimist';
import { Provider }                              from 'react-redux';
import createSagaMiddleware                      from 'redux-saga';
import { applyMiddleware, compose, createStore } from 'redux';
import { PassThrough }                           from 'stream';

let argv = camelizeKeys(minimist(process.argv.slice(2), {
    boolean: [ `output`, `debug-console`, `debug-redraws`, `debug-shortcuts` ],
    default: { [`output`]: true, [`debug-console`]: false, [`debug-redraws`]: false, [`debug-shortcuts`]: false }
}));

let stdout = Object.create(process.stdout);
if (!argv.output) stdout.write = () => {};

let reducer = buildReducer(`${__dirname}/reducers`);
let saga = buildSaga(`${__dirname}/sagas`);

let sagaMiddleware = createSagaMiddleware();
let store = createStore(reducer, compose(reduxBatch, applyMiddleware(sagaMiddleware), reduxBatch));

sagaMiddleware.run(saga);

let screen = new TermScreen(), target = screen;
screen.attachScreen({ stdout });

if (!argv.output) {

    // We can disable the output - that's VERY useful when debugging, since it is sometimes quite impractical to use the virtual console (most notably when debugging the rendering, where using the virtual console could start infinite loops)

    console.log(`The renderer has been started, but nothing will be print on the screen except your console.log calls.`);

}

if (argv.debugPaintRects) {

    // Force the renderer to use a different background color during each render

    screen.debugPaintRects = true;

}

if (argv.debugShortcuts) {


    // Add a few interesting shortcuts, useful for debugging the app

    screen.addShortcutListener(`ctrl-r`, () => {

        screen.renderScreenImpl([ screen.elementClipRect ]);

    }, { capture: true });

    screen.addShortcutListener(`ctrl-p`, () => {

        screen.triggerUpdates();

        screen.traverse((node, depth) => {
            console.log(` `.repeat(depth * 2), node, node.elementWorldRect);
        });

    }, { capture: true });

}

if (argv.debugConsole) {

    // Add a virtual console inside the scene and hook the global console object.

    let container = new TermElement();
    container.style.flexDirection = `row`;
    container.style.width = `100%`;
    container.style.height = `100%`;
    container.appendTo(screen);

    let main = target = new TermElement();
    main.style.flex = 1;
    main.style.width = `100%`;
    main.style.height = `100%`;
    main.appendTo(container);

    let console = new TermText();
    console.style.flex = null;
    console.style.width = 80 + 2 + 2;
    console.style.height = `100%`;
    console.style.border = `modern`;
    console.style.padding = [ 0, 1 ];
    console.style.whiteSpace = `preWrap`;
    console.appendTo(container);

    if (argv.output !== false) {

        let consoleOutput = new PassThrough();
        Object.defineProperty(global, `console`, { value: new Console(consoleOutput) });

        consoleOutput.on(`data`, buffer => {
            console.textContent += buffer.toString();
            console.scrollTop = console.scrollHeight;
        });

    }

}

render(<Provider store={store}>
    <Application/>
</Provider>, target);
