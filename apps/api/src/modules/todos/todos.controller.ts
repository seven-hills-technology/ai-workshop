import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoInput, Todo } from './todo.types';

@Controller('todos')
export class TodosController {
  constructor(private readonly todos: TodosService) {}

  @Get()
  list(): Todo[] {
    return this.todos.list();
  }

  @Post()
  create(@Body() input: CreateTodoInput): Todo {
    return this.todos.create(input);
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string): Todo {
    return this.todos.complete(id);
  }
}
