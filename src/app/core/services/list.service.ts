import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type {
  CreateListDto,
  ListResponse,
  UpdateListDto,
} from '../../features/lists/models/list.model';
import { API_ENDPOINTS } from '../constants/api-endpoints.const';

/**
 * Exposes HTTP methods only.
 * List state within an open board is managed by BoardService.
 */
@Injectable({ providedIn: 'root' })
export class ListService {
  private readonly http = inject(HttpClient);

  getAll(boardId: string): Observable<ListResponse[]> {
    return this.http.get<ListResponse[]>(API_ENDPOINTS.LISTS.ALL(boardId));
  }

  getById(boardId: string, listId: string): Observable<ListResponse> {
    return this.http.get<ListResponse>(API_ENDPOINTS.LISTS.BY_ID(boardId, listId));
  }

  create(boardId: string, dto: CreateListDto): Observable<ListResponse> {
    return this.http.post<ListResponse>(API_ENDPOINTS.LISTS.ALL(boardId), dto);
  }

  update(boardId: string, listId: string, dto: UpdateListDto): Observable<ListResponse> {
    return this.http.put<ListResponse>(API_ENDPOINTS.LISTS.BY_ID(boardId, listId), dto);
  }

  delete(boardId: string, listId: string): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.LISTS.BY_ID(boardId, listId));
  }
}
