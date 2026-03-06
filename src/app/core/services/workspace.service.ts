import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_ENDPOINTS } from '../constants/api-endpoints.const';
import type {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  WorkspaceDetail,
  WorkspaceResponse,
} from '../../features/workspaces/models/workspace.model';

@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<WorkspaceResponse[]> {
    return this.http.get<WorkspaceResponse[]>(API_ENDPOINTS.WORKSPACES.ALL);
  }

  getById(id: string): Observable<WorkspaceDetail> {
    return this.http.get<WorkspaceDetail>(API_ENDPOINTS.WORKSPACES.BY_ID(id));
  }

  create(dto: CreateWorkspaceDto): Observable<WorkspaceResponse> {
    return this.http.post<WorkspaceResponse>(API_ENDPOINTS.WORKSPACES.ALL, dto);
  }

  update(id: string, dto: UpdateWorkspaceDto): Observable<WorkspaceResponse> {
    return this.http.put<WorkspaceResponse>(API_ENDPOINTS.WORKSPACES.BY_ID(id), dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.WORKSPACES.BY_ID(id));
  }
}
