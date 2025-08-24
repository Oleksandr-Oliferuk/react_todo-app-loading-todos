/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useState } from 'react';
import { UserWarning } from './UserWarning';
import { getTodos, USER_ID } from './api/todos';
import { Todo } from './types/Todo';
import { TodoList } from './components/TodoList/TodoList';
import cn from 'classnames';
import { Footer } from './components/Footer/Footer';
import { TodoFilter } from './types/TodoFilter';

function preperedData(dataTodos: Todo[], groupBy: string): Todo[] {
  let visibleTodos = [...dataTodos];

  visibleTodos = visibleTodos.filter((todos: Todo) => {
    switch (groupBy) {
      case TodoFilter.Active:
        return todos.completed === false;

      case TodoFilter.Completed:
        return todos.completed === true;

      default:
        return true;
    }
  });

  return visibleTodos;
}

export const App: React.FC = () => {
  const [todosDataFromServer, setodosDataFromServer] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loadingStartWindow, setLoadingStartWindow] = useState(false); // use with footer and list when starting window
  const [groupBy, setGroupBy] = useState<TodoFilter>(TodoFilter.All);

  const visibleData = preperedData(todosDataFromServer, groupBy);

  useEffect(() => {
    setErrorMessage('');
    setLoadingStartWindow(true);
    getTodos()
      .then((todosFromServer: Todo[]) => {
        setodosDataFromServer(todosFromServer);
        // console.log(todosFromServer);
      })
      .catch(() => setErrorMessage('Unable to load todos'))
      .finally(() => setLoadingStartWindow(false));
  }, []);

  // analyze state error and autoclose after  appearance for 3s
  useEffect(() => {
    let timerId: NodeJS.Timeout | number | undefined;

    if (errorMessage) {
      timerId = setTimeout(() => {
        setErrorMessage('');
      }, 3000);
    }

    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [errorMessage]);

  const handleGroupBy = (typeGroupBy: TodoFilter) => {
    setGroupBy(typeGroupBy);
  };

  //isShowElement analyze that we not loadWindow and count arr of todos > 0;
  const isShowElement = !loadingStartWindow && todosDataFromServer.length > 0;

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {/* this button should have `active` class only if all todos are completed */}
          {isShowElement && (
            <button
              type="button"
              className="todoapp__toggle-all active"
              data-cy="ToggleAllButton"
            />
          )}

          {/* Add a todo on form submit */}
          <form>
            <input
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
            />
          </form>
        </header>
        {isShowElement && (
          <TodoList
            todosDataFromServer={visibleData}
            loadingStartWindow={loadingStartWindow}
          />
        )}
        {/* Hide the footer if there are no todos */}

        {isShowElement && (
          <Footer
            todoCount={visibleData.length}
            handleGroupBy={handleGroupBy}
            groupBy={groupBy}
          />
        )}
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      <div
        data-cy="ErrorNotification"
        className={cn(
          `notification is-danger is-light has-text-weight-normal ${errorMessage.length > 0 ? '' : 'hidden'}`,
        )}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={() => setErrorMessage('')}
        />
        {/* show only one message at a time */}
        {errorMessage}
        {/* <br />
        Title should not be empty
        <br />
        Unable to add a todo
        <br />
        Unable to delete a todo
        <br />
        Unable to update a todo */}
      </div>
    </div>
  );
};
