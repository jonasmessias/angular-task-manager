import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_ENDPOINTS } from '../constants/api-endpoints.const';
import type {
  BoardDetail,
  BoardResponse,
  CreateBoardDto,
  UpdateBoardDto,
} from '../../features/boards/models/board.model';

@Injectable({ providedIn: 'root' })
export class BoardService {
  private readonly http = inject(HttpClient);

  getAll(workspaceId: string): Observable<BoardResponse[]> {
    const params = new HttpParams().set('workspaceId', workspaceId);
    return this.http.get<BoardResponse[]>(API_ENDPOINTS.BOARDS.ALL, { params });
  }

  getById(id: string): Observable<BoardDetail> {
    return this.http.get<BoardDetail>(API_ENDPOINTS.BOARDS.BY_ID(id));
  }

  create(workspaceId: string, dto: CreateBoardDto): Observable<BoardResponse> {
    const params = new HttpParams().set('workspaceId', workspaceId);
    return this.http.post<BoardResponse>(API_ENDPOINTS.BOARDS.ALL, dto, { params });
  }

  update(id: string, dto: UpdateBoardDto): Observable<BoardResponse> {
    return this.http.put<BoardResponse>(API_ENDPOINTS.BOARDS.BY_ID(id), dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.BOARDS.BY_ID(id));
  }
}
