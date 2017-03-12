import { TextEditor } from '@cideditor/cid/components/TextEditor';
import { statics }    from '@cideditor/cid/utils/decorators';

import { autobind }   from 'core-decorators';

let defaultEditor = <TextEditor

    style={{ width: `100%`, height: `100%` }}

    grammar={`language-babel`}
    theme={`Atom Dark`}

/>;

@statics({

    propTypes: {

        style: React.PropTypes.object,

        initialComponent: React.PropTypes.node,

    },

    defaultProps: {

        style: {},

        initialComponent: defaultEditor

    }

})

export class Splittable extends React.PureComponent {

    state = {

        direction: null,

        component: null

    };

    constructor(props) {

        super(props);

        this.state.component = props.initialComponent;

    }

    getSeparatorStyle() {

        switch (this.state.direction) {

            case `column`: {
                return { flex: null, width: `100%`, height: 1, backgroundColor: `white`, backgroundCharacter: `·`, color: `#888888` };
            } break;

            case `row`: {
                return { flex: null, width: 2, height: `100%`, backgroundColor: `white`, backgroundCharacter: `·`, color: `#888888` };
            } break;

        }

    }

    @autobind handleHorizontalSplit() {

        this.setState({ direction: `column` });

    }

    @autobind handleVerticalSplit() {

        this.setState({ direction: `row` });

    }

    render() {

        return this.state.direction ? <div style={{ ... this.props.style, flex: 1, flexDirection: this.state.direction }}>

            <Splittable initialComponent={this.state.component} />
            <div style={this.getSeparatorStyle()} />
            <Splittable />

        </div> : <div style={{ ... this.props.style, flex: 1 }} onShortcuts={{ [`ctrl-x /`]: this.handleHorizontalSplit, [`ctrl-x :`]: this.handleVerticalSplit }}>

            {this.state.component}

        </div>;

    }

}
