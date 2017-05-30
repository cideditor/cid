import { pathSetActive }  from '@cideditor/cid/actions';
import { TextEditor }     from '@cideditor/cid/components/TextEditor';
import { ImmutablePoint } from '@cideditor/cid/utils/ImmutablePoint';

import { autobind }       from 'core-decorators';
import { connect }        from 'react-redux';

@connect((state, props) => {

    let window = state.windowRegistry.getById(props.windowId);
    let container = state.containerRegistry.getById(props.containerId);
    let view = state.viewRegistry.getById(props.viewId);

    let isActiveWindow = window ? state.activeWindowId === window.id : false;

    return { window, container, view, isActiveWindow };

})

export class EditorView extends React.PureComponent {

    state = {

        caret: new ImmutablePoint({ x: 0, y: 0 }),
        scroll: new ImmutablePoint({ x: 0, y: 0 })

    };

    componentDidMount() {

        if (this.props.isActiveWindow)
            this.props.dispatch(pathSetActive(this.props.view.descriptor));

        if (this.props.isActiveWindow) {
            this.main.focus();
        }

    }

    componentWillReceiveProps(nextProps) {

        if (this.props.isActiveWindow) {
            this.props.dispatch(pathSetActive(this.props.view.descriptor));
        }

    }

    componentDidUpdate() {

        if (this.props.isActiveWindow) {
            this.main.focus();
        }

    }

    @autobind handleCaret(caret) {

        this.setState(state => {
            return { caret: ImmutablePoint.update(state.caret, caret) };
        });

    }

    @autobind handleScroll(scroll) {

        this.setState(state => {
            return { scroll: ImmutablePoint.update(state.scroll, scroll) };
        });

    }

    @autobind registerMainRef(main) {

        this.main = main;

    }

    render() {

        let { grammar, theme, textBuffer } = this.props.view;

        return <div style={{ width: `100%`, height: `100%` }}>

            <TextEditor ref={this.registerMainRef}

                style={{ flex: 1, width: `100%`, height: `100%` }}

                {... { grammar, theme, textBuffer }}

                caret={this.state.caret}
                scroll={this.state.scroll}

                onCaret={this.handleCaret}
                onScroll={this.handleScroll}

            />

            <div style={{ flexDirection: `row`, flex: null, width: `100%`, height: 1,  backgroundColor: this.props.isActiveWindow ? `#CCCCCC` : `#333333`, color: this.props.isActiveWindow ? `#000000` : `#FFFFFF` }}>

                <text style={{ flex: null }}
                    textContent={`[${grammar}]`}
                />

                <text style={{ margin: [ 0, 1 ], flex: null, padding: [ 0, 1 ], background: `white`, color: `black` }}
                    textContent={this.props.view.name}
                />

                <text style={{ flex: null }}
                    textContent={`(${this.state.caret.y}:${this.state.caret.x})`}
                />

            </div>

        </div>;

    }

}
