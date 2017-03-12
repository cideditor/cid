import { TypeAhead } from '@cideditor/cid/components/TypeAhead';
import { statics }   from '@cideditor/cid/utils/decorators';

import { autobind }  from 'core-decorators';

@statics({

    propTypes: {

        style: React.PropTypes.object,

        choices: React.PropTypes.immutable.listOf(React.PropTypes.string),

        initialValue: React.PropTypes.string,

        onSubmit: React.PropTypes.func

    },

    defaultProps: {

        style: {},

        initialValue: ``,

        onSubmit: () => {}

    }

})

export class TypeAheadDialog extends React.PureComponent {

    state = {

        value: ``

    };

    constructor(props) {

        super(props);

        this.state.value = props.initialValue;

    }

    @autobind handleSubmit() {

        this.props.onSubmit(this.state.value);

    }

    @autobind handleChange(value) {

        this.setState({ value });

    }

    render() {

        return <form style={{ border: `modern`, ... this.props.style }} onSubmit={this.handleSubmit}>
            <TypeAhead choices={this.props.choices} value={this.state.value} onChange={this.handleChange} absolute={false} autofocus={`steal`} />
        </form>;

    }

}
