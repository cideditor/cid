import { windowSetActive, windowSplit, windowKill } from '@cideditor/cid/actions';
import { WindowEntry }                              from '@cideditor/cid/reducers/windowRegistry';
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

    let window = state.windowRegistry.entries.get(props.windowId);
    let view = window.viewId !== null ? state.viewRegistry.entries.get(window.viewId) : null;

    let isActiveWindow = state.activeWindowId === window.id;

    return { window, view, isActiveWindow };

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

        if (this.props.isActiveWindow && focused) {
            focused.focus();
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
                return null;//<div style={{ flex: null, width: `100%`, height: 1, backgroundColor: `white`, backgroundCharacter: `·`, color: `#888888` }} />;
            } break;

            case WindowEntry.WINDOW_TYPE_ROW: {
                return <div style={{ flex: null, width: 2, height: `100%`, backgroundColor: `lightgrey` }} />;
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

    getShortcuts() {

        return {

            [`ctrl-x /`]: this.handleColumnSplitShortcut,
            [`ctrl-x :`]: this.handleRowSplitShortcut,
            [`ctrl-x 0`]: this.handleKillWindowShortcut,

            [`alt-left`]: this.handleGotoLeftShortcut,
            [`alt-right`]: this.handleGotoRightShortcut,
            [`alt-up`]: this.handleGotoUpShortcut,
            [`alt-down`]: this.handleGotoDownShortcut

        };

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

            this.props.dispatch(windowSetActive(this.props.windowId));

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

    @autobind handleColumnSplitShortcut(e) {

        e.setDefault(() => {

            this.props.dispatch(windowSplit(this.props.windowId, { splitType: WindowEntry.WINDOW_TYPE_COLUMN }));

        });

    }

    @autobind handleRowSplitShortcut(e) {

        e.setDefault(() => {

            this.props.dispatch(windowSplit(this.props.windowId, { splitType: WindowEntry.WINDOW_TYPE_ROW }));

        });

    }

    @autobind handleKillWindowShortcut(e) {

        e.setDefault(() => {

            this.props.dispatch(windowKill(this.props.windowId));

        });

    }

    @autobind handleGotoLeftShortcut(e) {

        e.setDefault(() => {

            this.props.onGotoLeft(this.props.windowId);

        });

    }

    @autobind handleGotoRightShortcut(e) {

        e.setDefault(() => {

            this.props.onGotoRight(this.props.windowId);

        });

    }

    @autobind handleGotoUpShortcut(e) {

        e.setDefault(() => {

            this.props.onGotoUp(this.props.windowId);

        });

    }

    @autobind handleGotoDownShortcut(e) {

        e.setDefault(() => {

            this.props.onGotoDown(this.props.windowId);

        });

    }

    @autobind handleGotoLeft(windowId) {

        if (this.props.window.type !== WindowEntry.WINDOW_TYPE_ROW)
            return this.props.onGotoLeft(this.props.windowId);

        let index = this.props.window.childrenIds.indexOf(windowId);

        if (index === 0)
            return this.props.onGotoLeft(this.props.windowId);

        let window = this.children.get(this.props.window.childrenIds.get(index - 1));

        window.getWrappedInstance().requestActivate();

    }


    @autobind handleGotoRight(windowId) {

        if (this.props.window.type !== WindowEntry.WINDOW_TYPE_ROW)
            return this.props.onGotoRight(this.props.windowId);

        let index = this.props.window.childrenIds.indexOf(windowId);

        if (index === this.props.window.childrenIds.size - 1)
            return this.props.onGotoRight(this.props.windowId);

        let window = this.children.get(this.props.window.childrenIds.get(index + 1));

        window.getWrappedInstance().requestActivate();

    }

    @autobind handleGotoUp(windowId) {

        if (this.props.window.type !== WindowEntry.WINDOW_TYPE_COLUMN)
            return this.props.onGotoUp(this.props.windowId);

        let index = this.props.window.childrenIds.indexOf(windowId);

        if (index === 0)
            return this.props.onGotoUp(this.props.windowId);

        let window = this.children.get(this.props.window.childrenIds.get(index - 1));

        window.getWrappedInstance().requestActivate();

    }

    @autobind handleGotoDown(windowId) {

        if (this.props.window.type !== WindowEntry.WINDOW_TYPE_COLUMN)
            return this.props.onGotoDown(this.props.windowId);

        let index = this.props.window.childrenIds.indexOf(windowId);

        if (index === this.props.window.childrenIds.size - 1)
            return this.props.onGotoDown(this.props.windowId);

        let window = this.children.get(this.props.window.childrenIds.get(index + 1));

        window.getWrappedInstance().requestActivate();

    }

    @autobind handleFocusCapture(e) {

        if (this.props.window.type !== WindowEntry.WINDOW_TYPE_VIEW)
            return;

        this.props.dispatch(windowSetActive(this.props.windowId));

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

            return <div ref={this.registerMainRef} style={{ ... this.props.style, flex: 1, width: `100%`, height: `100%` }} onShortcuts={this.getShortcuts()} onFocusCapture={this.handleFocusCapture}>
            </div>;

        }

    }

}

@connect((state, props) => {

    let view = state.viewRegistry.entries.get(props.viewId);

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
