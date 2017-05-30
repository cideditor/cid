import { windowSetActive, windowSplit, windowKill } from '@cideditor/cid/actions';
import { WINDOW_TYPE }                              from '@cideditor/cid/reducers/windowRegistry';
import { WindowEntry }                              from '@cideditor/cid/reducers/windowRegistry';
import { windowShortcuts }                          from '@cideditor/cid/shortcuts';
import { applyShortcuts }                           from '@cideditor/cid/utils/applyShortcuts';
import { connect }                                  from '@cideditor/cid/utils/decorators';

import * as ReactTerm                               from '@manaflair/mylittledom/term/react';
import { isChildOf }                                from '@manaflair/mylittledom';

import { autobind }                                 from 'core-decorators';

@connect((state, props) => {

    return { containerRegistry: state.containerRegistry };

})

export class Application extends React.PureComponent {

    render() {

        return <div style={{ width: `100%`, height: `100%` }}>

            <Window windowId={1} />

            {this.props.containerRegistry.idSeq().map(containerId =>
                <Container key={containerId} containerId={containerId} />
            )}

        </div>;

    }

}

@connect((state, props) => {

    let window = state.windowRegistry.getById(props.windowId);
    let container = state.containerRegistry.getById(window.containerId);

    let isActiveWindow = state.activeWindowId === window.id;

    let activeDialog = isActiveWindow && state.dialogStack.size > 0 ? state.dialogStack.first() : null;

    return { window, container, isActiveWindow, activeDialog };

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

        this.main = null;
        this.container = null;
        this.children = new Map();

    }

    componentDidMount() {

        let focused = this.props.container
            ? this.props.container.element.rootNode.activeElement
            : null;

        if (this.props.container)
            this.container.appendChild(this.props.container.element);

        if (this.props.isActiveWindow && focused) {
            focused.focus();
        }

    }

    componentDidUpdate(prevProps) {

        let focused = this.main
            ? this.main.rootNode.activeElement
            : null;

        if (prevProps.container && this.props.container !== prevProps.container && prevProps.container.element.parentNode === this.main)
            this.container.removeChild(prevProps.container.element);

        if (this.props.container)
            this.container.appendChild(this.props.container.element);

        if (this.props.isActiveWindow && focused)
            focused.focus();

        if (this.props.isActiveWindow && this.props.window.type !== WindowEntry.WINDOW_TYPE_VIEW) {
            this.requestActivate();
        }

    }

    componentWillUnmount() {

        if (this.props.container && this.props.container.element.parentNode === this.main) {
            this.container.removeChild(this.props.container);
        }

    }

    getSeparator() {

        switch (this.props.window.type) {

            case WINDOW_TYPE.COLUMN: {
                return null;
            } break;

            case WINDOW_TYPE.ROW: {
                return <div style={{ flex: null, width: 2, height: `100%`, backgroundColor: `#333333` }} />;
            } break;

        }

    }

    getDirection() {

        switch (this.props.window.type) {

            case WINDOW_TYPE.COLUMN: {
                return `column`;
            } break;

            case WINDOW_TYPE.ROW: {
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

        if (this.props.window.type !== WINDOW_TYPE.VIEW) {

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

    @autobind registerContainerRef(container) {

        this.container = container;

    }

    @autobind registerChildRef(windowId, child) {

        if (child) {
            this.children.set(windowId, child);
        } else {
            this.children.delete(windowId);
        }

    }

    @autobind handleFocusCapture(e) {

        if (this.props.window.type !== WINDOW_TYPE.VIEW)
            return;

        this.props.dispatch(windowSetActive(this.props.window.id));

    }

    render() {

        if (this.props.window.type !== WINDOW_TYPE.VIEW) {

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

                {this.props.activeDialog && <div style={{ position: `absolute`, left: 2, right: 2, top: 1 }}>
                    {this.props.activeDialog}
                </div>}

               <div ref={this.registerContainerRef} style={{ flex: 1, width: `100%`, height: `100%` }}>
                    {/* this.props.container.element will be inserted here */}
                </div>

            </div>;

        }

    }

}

@connect((state, props) => {

    let window = state.windowRegistry.getByContainerId(props.containerId);
    let container = state.containerRegistry.getById(props.containerId);
    let view = container ? state.viewRegistry.getById(container.viewId) : null;

    return { window, container, view };

})

class Container extends React.PureComponent {

    render() {

        if (!this.props.view || !this.props.view.component)
            return null;

        return ReactTerm.createPortal(React.cloneElement(this.props.view.component, {
            windowId: this.props.window ? this.props.window.id : null,
            containerId: this.props.container.id,
            viewId: this.props.view.id,
        }), this.props.container.element);

    }

}
