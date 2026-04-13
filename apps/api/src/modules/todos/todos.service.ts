import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateTodoInput, Todo } from './todo.types';

@Injectable()
export class TodosService {
  private todos: Todo[] = [
    {
      id: randomUUID(),
      title: 'Try the workshop repo',
      status: 'open',
      createdAt: new Date().toISOString(),
    },
  ];

  list(): Todo[] {
    return this.todos;
  }

  create(input: CreateTodoInput): Todo {
    const todo: Todo = {
      id: randomUUID(),
      title: input.title,
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    this.todos.push(todo);
    return todo;
  }

  complete(id: string): Todo {
    const todo = this.todos.find((t) => t.id === id);
    if (!todo) {
      throw new NotFoundException(`todo ${id} not found`);
    }
    todo.status = 'done';
    return todo;
  }
}
