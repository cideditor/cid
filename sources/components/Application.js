import { windowSetActive, windowSplit, windowKill } from '@cideditor/cid/actions';
import { WindowEntry }                              from '@cideditor/cid/reducers/windowRegistry';
import { windowShortcuts }                          from '@cideditor/cid/shortcuts';
import { applyShortcuts }                           from '@cideditor/cid/utils/applyShortcuts';
import { connect }                                  from '@cideditor/cid/utils/decorators';

import * as ReactTerm                               from '@manaflair/mylittledom/term/react';
import { isChildOf }                                from '@manaflair/mylittledom';

import { autobind }                                 from 'core-decorators';

@connect((state, props) => {

    let viewIds = state.viewRegistry.entries.keySeq();

    return { viewIds };

})

export class Application extends React.PureComponent {

    render() {

        return <div style={{ width: `100%`, height: `100%` }}>

            <Window windowId={0} />

            {this.props.viewIds.map(viewId =>
                <View key={viewId} viewId={viewId} />
            )}

        </div>;

    }

}

@connect((state, props) => {

    let window = state.windowRegistry.getById(props.windowId);
    let view = state.viewRegistry.getById(window.viewId);

    let isActiveWindow = state.activeWindowId === window.id;

    let popup = isActiveWindow ? state.activePopup : null;

    return { window, view, popup, isActiveWindow };

})

class Window extends React.PureComponent {

    static propTypes = {

        onGotoLeft: React.PropTypes.func,
        onGotoRight: React.PropTypes.func,
        onGotoUp: React.PropTypes.func,
        onGotoDown: React.PropTypes.func

    };

    static defaultProps = {

        onGotoLeft: () => {},
        onGotoRight: () => {},
        onGotoUp: () => {},
        onGotoDown: () => {}

    };

    constructor(props) {

        super(props);

        this.children = new Map();

    }

    componentDidMount() {

        let focused = this.props.view ? this.props.view.container.rootNode.activeElement : null;

        if (this.props.view)
            this.main.appendChild(this.props.view.container);

        if (this.props.isActiveWindow && focused) {
            focused.focus();
        }

    }

    componentDidUpdate(prevProps) {

        let focused = this.main ? this.main.rootNode.activeElement : null;

        if (prevProps.view && this.props.view !== prevProps.view && prevProps.view.container.parentNode === this.main)
            this.main.removeChild(prevProps.view.container);

        if (this.props.view)
            this.main.appendChild(this.props.view.container);

        if (this.props.isActiveWindow && focused)
            focused.focus();

        if (this.props.isActiveWindow && this.props.window.type !== WindowEntry.WINDOW_TYPE_VIEW) {
            this.requestActivate();
        }

    }

    componentWillUnmount() {

        if (this.props.view && this.props.view.container.parentNode === this.main) {
            this.main.removeChild(this.props.view.container);
        }

    }

    getSeparator() {

        switch (this.props.window.type) {

            case WindowEntry.WINDOW_TYPE_COLUMN: {
                return null;
            } break;

            case WindowEntry.WINDOW_TYPE_ROW: {
                return <div style={{ flex: null, width: 2, height: `100%`, backgroundColor: `#333333` }} />;
            } break;

        }

    }

    getDirection() {

        switch (this.props.window.type) {

            case WindowEntry.WINDOW_TYPE_COLUMN: {
                return `column`;
            } break;

            case WindowEntry.WINDOW_TYPE_ROW: {
                return `row`;
            } break;

            default: {
                return null;
            } break;

        }

    }

    getBoundingClientRect() {

        if (!this.main)
            return null;

        return this.main.getBoundingClientRect();

    }

    requestActivate() {

        if (this.props.window.type !== WindowEntry.WINDOW_TYPE_VIEW) {

            if (this.props.window.childrenIds.size === 0)
                return;

            let cascadedWindowId = this.props.window.childrenIds.get(0);

            let caret = this.main ? this.main.rootNode.getCaretCoordinates() : null;

            if (caret) {

                let shortestDistance = Infinity;

                for (let [ windowId, component ] of this.children.entries()) {

                    let boundingRect = component.getBoundingClientRect();

                    if (!boundingRect)
                        continue;

                    let distance = boundingRect.getDistanceFromPoint(caret).length;

                    if (distance <= shortestDistance) {
                        cascadedWindowId = windowId;
                        shortestDistance = distance;
                    }

                }

            }

            let childWindow = this.children.get(cascadedWindowId);

            childWindow.requestActivate();

        } else {

            this.props.dispatch(windowSetActive(this.props.window.id));

        }

    }

    @autobind registerMainRef(main) {

        this.main = main;

    }

    @autobind registerChildRef(windowId, child) {

        if (child) {
            this.children.set(windowId, child);
        } else {
            this.children.delete(windowId);
        }

    }

    @autobind handleFocusCapture(e) {

        if (this.props.window.type !== WindowEntry.WINDOW_TYPE_VIEW)
            return;

        this.props.dispatch(windowSetActive(this.props.window.id));

    }

    render() {

        if (this.props.window.type !== WindowEntry.WINDOW_TYPE_VIEW) {

            let separator = this.getSeparator();

            let WrapperComponent = Window.WrapperComponent; // otherwise they won't be connect()'d
            let subViewComponents = [];

            for (let t = 0; t < this.props.window.childrenIds.size; ++t) {

                let windowId = this.props.window.childrenIds.get(t);

                if (separator && t > 0) subViewComponents.push(React.cloneElement(separator, {
                    key: `separator-${t}`
                }));

                subViewComponents.push(<WrapperComponent

                    key={windowId}
                    ref={child => this.registerChildRef(windowId, child)}

                    windowId={windowId}

                    onGotoLeft={this.handleGotoLeft}
                    onGotoRight={this.handleGotoRight}
                    onGotoUp={this.handleGotoUp}
                    onGotoDown={this.handleGotoDown}

                />);

            }

            return <div ref={this.registerMainRef} style={{ ... this.props.style, flex: 1, width: `100%`, height: `100%`, flexDirection: this.getDirection() }}>
                {subViewComponents}
            </div>;

        } else {

            return <div ref={this.registerMainRef} style={{ ... this.props.style, flex: 1, width: `100%`, height: `100%` }} onShortcuts={applyShortcuts(windowShortcuts, { windowId: this.props.window.id, dispatch: this.props.dispatch })} onFocusCapture={this.handleFocusCapture}>
                {this.props.popup}
            </div>;

        }

    }

}

@connect((state, props) => {

    let view = state.viewRegistry.getById(props.viewId);

    return { view };

})

class View extends React.PureComponent {

    render() {

        let { component, container } = this.props.view;

        return ReactTerm.createPortal(React.cloneElement(component, {
            viewId: this.props.viewId
        }), container);

    }

}
