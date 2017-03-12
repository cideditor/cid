import { statics }     from '@cideditor/cid/utils/decorators';

import { makeRuleset } from '@manaflair/mylittledom';

import { autobind }    from 'core-decorators';

let selectClass = makeRuleset({

});

let selectItemClass = makeRuleset({

});

let selectedItemClass = makeRuleset({

    background: `blue`,
    color: `white`

});

@statics({

    propTypes: {

        value: React.PropTypes.any,

        children: React.PropTypes.oneOfType([
            React.PropTypes.immutable.listOf(React.PropTypes.element),
            React.PropTypes.element
        ]),

        onChange: React.PropTypes.func

    },

    defaultProps: {

        onChange: () => {}

    }

})

export class Select extends React.PureComponent {

    @autobind handleUpKey(e) {

        e.preventDefault();

        this.moveBy(-1);

    }

    @autobind handleDownKey(e) {

        e.preventDefault();

        this.moveBy(+1);

    }

    moveBy(n) {

        if (n === 0)
            return;

        let items = this.props.children.toArray();

        let index = items.findIndex(child => child.props.value === this.props.value);
        let nextIndex = (index + n) % items.length;

        if (index === -1)
            nextIndex = index < 0 ? 0 : items.length - 1;

        if (nextIndex < 0)
            nextIndex += items.length;

        let nextValue = items[nextIndex].props.value;

        this.props.onChange(nextValue, nextIndex);

    }

    render() {

        return <div>

            {React.Children.map(this.props.children, (child, index) => {

                let selected = child.props.value === this.props.value;

                let onUpKey = e => this.handleUpKey(e, index);
                let onDownKey = e => this.handleDownKey(e, index);

                return React.cloneElement(child, { onUpKey, onDownKey, selected });

            })}

        </div>;

    }

}

export class SelectItem extends React.PureComponent {

    static propTypes = {

        value: React.PropTypes.any.isRequired,

        children: React.PropTypes.node,

        selected: React.PropTypes.bool,

        onUpKey: React.PropTypes.func,
        onDownKey: React.PropTypes.func

    };

    @autobind handleUp() {

        this.props.onUpKey();

    }

    render() {

        return <div classList={[ selectItemClass, this.props.selected && selectedItemClass ]} onShortcutUp={this.props.handleUp} onShortcutDown={this.props.handleDown}>
            {this.props.children || this.props.value}
        </div>;

    }

}
