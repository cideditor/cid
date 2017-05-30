import { Application }                           from '@cideditor/cid/components/Application';
import { buildReducer }                          from '@cideditor/cid/utils/buildReducer';
import { buildSaga }                             from '@cideditor/cid/utils/buildSaga';

import { createSagaDispatcher }                  from '@manaflair/action-sagas';
import { render }                                from '@manaflair/mylittledom/term/react';
import { TermElement, TermScreen, TermText }     from '@manaflair/mylittledom/term';
import { reduxBatch }                            from '@manaflair/redux-batch';

import { Console }                               from 'console';
import { Provider }                              from 'react-redux';
import createSagaMiddleware                      from 'redux-saga';
import { applyMiddleware, compose, createStore } from 'redux';
import { PassThrough }                           from 'stream';
import { StringDecoder }                         from 'string_decoder';

export function setupAction(action, { ui = false } = {}) {

    return env => {

        if (ui) {
            startUi(env)(action);
        } else {
            return action(env);
        }

    };

}

function startUi(env) {

    let screen = new TermScreen();
    let renderTarget = screen;

    if (env.debugPaintRects)
        screen.debugPaintRects = true;

    if (env.debugConsole)
        renderTarget = startUiConsole(env, renderTarget);

    let stdout = Object.create(process.stdout);
    if (!env.output) stdout.write = () => {};

    let reducer = buildReducer(`${__dirname}/../reducers`);
    let saga = buildSaga(`${__dirname}/../sagas`);

    let sagaMiddleware = createSagaMiddleware({ emitter: emit => action => {
        if (Array.isArray(action)) store.dispatch(action);
        else emit(action);
    }});

    let sagaDispatcher = createSagaDispatcher(sagaMiddleware);

    let store = createStore(reducer, compose(reduxBatch, applyMiddleware(sagaMiddleware), reduxBatch, applyMiddleware(sagaDispatcher), reduxBatch));
    let ui = <Provider store={store} children={<Application />} />;

    sagaMiddleware.run(saga);

    return action => {

        store.dispatch(action(env));
        render(ui, renderTarget);

        screen.attachScreen({ stdout });

    };

}

function startUiConsole(env, renderTarget) {

    let container = new TermElement();
    container.style.flexDirection = `row`;
    container.style.width = `100%`;
    container.style.height = `100%`;
    container.appendTo(renderTarget);

    let main = renderTarget = new TermElement();
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

    if (!env.output)
        return renderTarget;

    let consoleOutput = new PassThrough();

    let decoder = new StringDecoder(`utf8`);
    consoleOutput.on(`data`, buffer => console.textContent += decoder.write(buffer));
    consoleOutput.on(`end`, () => console.textContent += decoder.end());

    Reflect.defineProperty(global, `console`, {
        value: new Console(consoleOutput)
    });

    return renderTarget;

}
