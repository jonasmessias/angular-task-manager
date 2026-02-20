import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateTaskDto, Task, UpdateTaskDto } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TasksService {
  getTasks(): Observable<Task[]> {
    throw new Error('Not implemented');
  }

  getTaskById(id: string): Observable<Task | undefined> {
    throw new Error('Not implemented');
  }

  createTask(dto: CreateTaskDto): Observable<Task> {
    throw new Error('Not implemented');
  }

  updateTask(id: string, dto: UpdateTaskDto): Observable<Task | null> {
    throw new Error('Not implemented');
  }

  deleteTask(id: string): Observable<boolean> {
    throw new Error('Not implemented');
  }
}
