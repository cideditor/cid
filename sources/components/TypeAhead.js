import { Select, SelectItem } from '@cideditor/cid/components/Select';
import { statics }            from '@cideditor/cid/utils/decorators';

import { autobind }           from 'core-decorators';
import Suggester              from 'suggester';

@statics({

    propTypes: {

        choices: React.PropTypes.immutable.listOf(React.PropTypes.string),

        value: React.PropTypes.string,

        absolute: React.PropTypes.bool,
        autofocus: React.PropTypes.string,

        onBlur: React.PropTypes.func,
        onChange: React.PropTypes.func

    },

    defaultProps: {

        choices: Immutable.List(),

        value: ``,

        absolute: true,

        onChange: () => {}

    }

})

export class TypeAhead extends React.PureComponent {

    state = {

        value: ``,

        suggestions: []

    };

    constructor(props) {

        super(props);

        this.state.value = props.value;

    }

    @autobind handleInputBlur() {

        this.props.onBlur();

    }

    @autobind handleInputChange(e) {

        let value = e.target.value;
        let suggestions = this.search(value);

        this.setState({ value, suggestions });

        this.props.onChange(value);

    }

    @autobind handleSelectChange(value) {

        this.props.onChange(value);

    }

    @autobind handleUp(e) {

        e.setDefault(() => {

            if (!this.suggestions)
                return;

            this.suggestions.moveBy(-1);

        });

    }

    @autobind handleDown(e) {

        e.setDefault(() => {

            if (!this.suggestions)
                return;

            this.suggestions.moveBy(+1);

        });

    }

    search(value) {

        if (value.length === 0)
            return Immutable.List();

        let normalize = value => value.toLowerCase().replace(/\s+/g, ` `).trim();
        let searchValue = normalize(value);

        return this.props.choices.filter(choice => {
            return normalize(choice).indexOf(searchValue) !== -1;
        }).sort();

    }

    render() {

        return <div>

            <input

                value={this.props.value}

                autofocus={this.props.autofocus}

                onBlur={this.handleInputBlur}
                onChange={this.handleInputChange}

                onShortcuts={{

                    [`down`]: this.handleDown,
                    [`up`]: this.handleUp

                }}

            />

            {this.state.suggestions && this.state.suggestions.size > 0 &&

                <Select ref={suggestions => { this.suggestions = suggestions }} style={this.props.absolute ? { position: `absolute`, left: 0, right: 0, top: 1, maxHeight: 10 } : { maxHeight: 10 }} value={this.props.value} onChange={this.handleSelectChange}>

                    {this.state.suggestions.map(choice => {
                        return <SelectItem key={choice} value={choice} />;
                    })}

                </Select>

            }

        </div>;

    }

}
