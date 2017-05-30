import { ImmutablePoint }    from '@cideditor/cid/utils/ImmutablePoint';

import { SyntaxHighlighter } from '@manaflair/mylittledom/extra';

import { autobind }          from 'core-decorators';
import { readFileSync }      from 'fs';
import TextBuffer            from 'text-buffer';

export class TextEditor extends React.PureComponent {

    static propTypes = {

        style: React.PropTypes.object,

        textBuffer: React.PropTypes.instanceOf(TextBuffer),

        grammar: React.PropTypes.string,
        theme: React.PropTypes.string,

        caret: React.PropTypes.instanceOf(ImmutablePoint),
        scroll: React.PropTypes.instanceOf(ImmutablePoint),
        value: React.PropTypes.string,

        onCaret: React.PropTypes.func,
        onScroll: React.PropTypes.func,
        onChange: React.PropTypes.func,

        autofocus: React.PropTypes.string,

    };

    static defaultProps = {

        style: {},

        textBuffer: undefined,

        grammar: null,
        theme: null,

        value: undefined,

        onCaret: () => {},
        onChange: () => {},
        onScroll: () => {}

    };

    state = {

        backgroundColor: null

    };

    constructor(props) {

        super(props);

        this.highlighter = new SyntaxHighlighter();

    }

    componentWillMount() {

        this.setGrammar(this.props.grammar);
        this.setTheme(this.props.theme);

    }

    componentWillReceiveProps(nextProps) {

        if (nextProps.grammar !== this.props.grammar)
            this.setGrammar(nextProps.grammar);

        if (nextProps.theme !== this.props.theme) {
            this.setTheme(nextProps.theme);
        }

    }

    getShortcuts() {

        return {

            [`ctrl-t`]: this.handleThemeSelect

        };

    }

    setGrammar(grammar: string) {

        if (grammar !== null && !this.highlighter.grammar.registry.has(grammar))
//          this.highlighter.grammar.load(grammar, readFileSync(require.resolve(`@cideditor/cid/grammars/${grammar}.tmLanguage`)));
            this.highlighter.grammar.load(grammar, readFileSync(`${__dirname}/../grammars/${grammar}.json`));

        this.highlighter.grammar.use(grammar);

        if (this.input) {
            this.highlighter.grammar.apply().apply(this.input.textLines);
            this.input.queueDirtyRect();
        }

    }

    setTheme(theme: string) {

        if (theme !== null && !this.highlighter.theme.registry.has(theme))
//          this.highlighter.theme.load(theme, readFileSync(require.resolve(`@cideditor/cid/themes/${theme}.tmTheme`)));
            this.highlighter.theme.load(theme, readFileSync(`${__dirname}/../themes/${theme}.tmTheme`));

        this.highlighter.theme.use(theme);

        if (this.input) {
            this.highlighter.theme.apply().apply(this.input.textLines);
            this.input.queueDirtyRect();
        }

        this.setState({ backgroundColor: this.highlighter.theme.resolve([], `background`, null) });

    }

    focus() {

        if (!this.input)
            return;

        this.input.focus();

    }

    blur() {

        if (!this.input)
            return;

        this.input.blur();

    }

    @autobind setLinenoRef(lineno) {

        this.lineno = lineno;

    }

    @autobind renderLineno(x: number, y: number, l: number) {

        if (!this.input)
            return this.lineno.renderBackground(l);

        return `${y + this.input.scrollTop}`.padEnd(4).substr(x, l);

    }

    @autobind setInputRef(input) {

        this.input = input;

    }

    @autobind handleCaret(e) {

        let { x, y } = e.target.caret;

        this.props.onCaret({ x, y });

    }

    @autobind handleChange(e) {

        this.props.onChange(e.target.value);

    }

    @autobind handleScroll(e) {

        let { x, y } = e.target.scrollRect;

        this.lineno.queueDirtyRect();

        this.props.onScroll({ x, y });

    }

    render() {

        return <div style={{

            flexDirection: `row`,

            ... this.props.style

        }}>

            <div ref={this.setLinenoRef}

                style={{

                    flex: null,
                    width: 5,
                    height: `100%`,

                    padding: [ 0, 1 ]

                }}

                contentRenderer={this.renderLineno}

            />

            <input ref={this.setInputRef}

                style={{

                    flex: 1,
                    width: `100%`,
                    height: `100%`,

                    paddingLeft: 1,

                    whiteSpace: `pre`,

                    backgroundColor: this.state.backgroundColor

                }}

                textBuffer={this.props.textBuffer}
                textLayout={this.highlighter}

                caret={this.props.caret}
                scroll={this.props.scroll}
                value={this.props.value}

                onCaret={this.handleCaret}
                onScroll={this.handleScroll}
                onChange={this.handleChange}

                onShortcuts={this.getShortcuts()}

                multiline={true}
                decored={false}

                autofocus={this.props.autofocus}

            />

        </div>;

    }

}
