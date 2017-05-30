import { dialogClose }     from '@cideditor/cid/actions';
import { TypeAheadDialog } from '@cideditor/cid/components/TypeAheadDialog';

import { autobind }        from 'core-decorators';
import { connect }         from 'react-redux';

@connect((state, props) => ({

}))

export class FileSelectorDialog extends React.PureComponent {

    static propTypes = {

        initialPath: React.PropTypes.string.isRequired

    };

    @autobind handleBlur() {

        this.props.dispatch(dialogClose());

    }

    render() {

        return <TypeAheadDialog onBlur={this.handleBlur} initialValue={this.props.initialPath} />;

    }

}
