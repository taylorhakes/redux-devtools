import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import TodoTextInput from './TodoTextInput';
import editing from '../reducers/editing';
import { editModeTodo } from '../actions/TodoActions';
import { local } from '../LocalState';

@local({
  keyFunc(props) {
    return 'todo-' +props.todo.id;
  },
  reducers:  {
    isEditing: editing
  }
})
export default class TodoItem extends Component {
  static propTypes = {
    todo: PropTypes.object.isRequired,
    editTodo: PropTypes.func.isRequired,
    deleteTodo: PropTypes.func.isRequired,
    markTodo: PropTypes.func.isRequired
  };

  constructor(props, context) {
    super(props, context);
  }

  editModeTodo(isEditing) {
    this.props.dispatch(editModeTodo(isEditing));
  }

  handleDoubleClick() {
    this.editModeTodo(true);
  }

  handleSave(id, text) {
    if (text.length === 0) {
      this.props.deleteTodo(id);
    } else {
      this.props.editTodo(id, text);
    }
    this.editModeTodo(false);
  }

  render() {
    const {todo, markTodo, deleteTodo} = this.props;

    let element;
    if (this.props.isEditing) {
      element = (
        <TodoTextInput defaultText={todo.text}
                       editing={this.props.isEditing}
                       onSave={(text) => this.handleSave(todo.id, text)} />
      );
    } else {
      element = (
        <div className='view'>
          <input className='toggle'
                 type='checkbox'
                 checked={todo.marked}
                 onChange={() => markTodo(todo.id)} />
          <label onDoubleClick={::this.handleDoubleClick}>
            {todo.text}
          </label>
          <button className='destroy'
                  onClick={() => deleteTodo(todo.id)} />
        </div>
      );
    }

    return (
      <li className={classnames({
        completed: todo.marked,
        editing: this.props.isEditing
      })}>
        {element}
      </li>
    );
  }
}
