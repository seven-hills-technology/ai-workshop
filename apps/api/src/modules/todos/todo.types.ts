export type TodoStatus = 'open' | 'done';

export type Todo = {
  id: string;
  title: string;
  status: TodoStatus;
  createdAt: string;
};

export type CreateTodoInput = {
  title: string;
};
