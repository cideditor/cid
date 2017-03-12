import { statics }  from '@cideditor/cid/utils/decorators';

import { autobind } from 'core-decorators';

@statics({

    propTypes: {

        style: React.PropTypes.object,

        onSave: React.PropTypes.func

    },

    defaultProps: {

        onSave: () => {}

    }

})

export class ThemeEditor extends React.PureComponent {

    state = {

        name: `Untitled`

    };

    @autobind handleNameChange(e) {

        this.setState({ name: e.target.value });

    }

    render() {

        return <div style={{ padding: [ 0, 1 ] }}>

            <label>
                <div style={{ fontWeight: `bold` }}>Theme name:</div>
                <input value={this.state.name} onChange={this.handleNameChange} />
            </label>

            <div style={{ textAlign: `right` }}>
                Add new [+]
            </div>

        </div>;

    }

}
