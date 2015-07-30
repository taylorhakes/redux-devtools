import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import localText from '../reducers/localText';
import { changeTodo } from '../actions/TodoActions';
import { local } from '../LocalState';

@local({
    keyFunc(props) {
        if (props.stateKey) {
            return props.stateKey;
        }

        return 'textInput';
    },
    reducers:  {
        text: localText
    },
    getInitialState(props) {
        return {
            text: props.defaultText || ''
        }
    }
})
export default class TodoTextInput extends Component {
  static propTypes = {
    onSave: PropTypes.func.isRequired,
    text: PropTypes.string,
    placeholder: PropTypes.string,
    editing: PropTypes.bool,
    newTodo: PropTypes.bool
  };

  constructor(props, context) {
    super(props, context);
  }

  handleSubmit(e) {
    const text = e.target.value.trim();
    if (e.which === 13) {
      this.props.onSave(text);
      if (this.props.newTodo) {
          this.props.dispatch(changeTodo(''));
      }
    }
  }

  handleChange(e) {
    this.props.dispatch(changeTodo(e.target.value));
  }

  handleBlur(e) {
    if (!this.props.newTodo) {
      this.props.onSave(e.target.value);
    }
  }

  render() {
    return (
      <input className={classnames({
              edit: this.props.editing,
              'new-todo': this.props.newTodo
             })}
             type='text'
             placeholder={this.props.placeholder}
             autoFocus='true'
             value={this.props.text}
             onBlur={::this.handleBlur}
             onChange={::this.handleChange}
             onKeyDown={::this.handleSubmit} />
    );
  }
}
