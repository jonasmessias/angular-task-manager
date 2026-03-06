import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs';

import type {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  WorkspaceDetail,
  WorkspaceResponse,
} from '../../features/workspaces/models/workspace.model';
import { API_ENDPOINTS } from '../constants/api-endpoints.const';
import { AsyncState, initialAsyncState } from '../interfaces/async-state.interface';

@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  private readonly http = inject(HttpClient);

  // -- State ------------------------------------------------------------------

  private readonly _workspaces = signal<AsyncState<WorkspaceResponse[]>>(initialAsyncState([]));
  private readonly _activeWorkspace = signal<WorkspaceDetail | null>(null);
  private readonly _activeLoading = signal(false);
  private readonly _activeError = signal<string | null>(null);

  // -- Selectors --------------------------------------------------------------

  readonly workspaces = computed(() => this._workspaces().data);
  readonly workspacesLoading = computed(() => this._workspaces().loading);
  readonly workspacesError = computed(() => this._workspaces().error);

  readonly activeWorkspace = this._activeWorkspace.asReadonly();
  readonly activeLoading = this._activeLoading.asReadonly();
  readonly activeError = this._activeError.asReadonly();

  // -- Actions ----------------------------------------------------------------

  loadAll(): Observable<WorkspaceResponse[]> {
    this._workspaces.update((s) => ({ ...s, loading: true, error: null }));

    return this.http.get<WorkspaceResponse[]>(API_ENDPOINTS.WORKSPACES.ALL).pipe(
      tap({
        next: (data) => this._workspaces.set({ data, loading: false, error: null }),
        error: (err) =>
          this._workspaces.update((s) => ({
            ...s,
            loading: false,
            error: err?.error?.message ?? 'Erro ao carregar workspaces',
          })),
      }),
    );
  }

  loadById(id: string): Observable<WorkspaceDetail> {
    this._activeLoading.set(true);
    this._activeError.set(null);

    return this.http.get<WorkspaceDetail>(API_ENDPOINTS.WORKSPACES.BY_ID(id)).pipe(
      tap({
        next: (data) => {
          this._activeWorkspace.set(data);
          this._activeLoading.set(false);
        },
        error: (err) => {
          this._activeError.set(err?.error?.message ?? 'Erro ao carregar workspace');
          this._activeLoading.set(false);
        },
      }),
    );
  }

  create(dto: CreateWorkspaceDto): Observable<WorkspaceResponse> {
    return this.http
      .post<WorkspaceResponse>(API_ENDPOINTS.WORKSPACES.ALL, dto)
      .pipe(
        tap((created) => this._workspaces.update((s) => ({ ...s, data: [...s.data, created] }))),
      );
  }

  update(id: string, dto: UpdateWorkspaceDto): Observable<WorkspaceResponse> {
    return this.http.put<WorkspaceResponse>(API_ENDPOINTS.WORKSPACES.BY_ID(id), dto).pipe(
      tap((updated) => {
        this._workspaces.update((s) => ({
          ...s,
          data: s.data.map((w) => (w.id === id ? updated : w)),
        }));
        if (this._activeWorkspace()?.id === id) {
          this._activeWorkspace.update((w) => (w ? { ...w, ...updated } : w));
        }
      }),
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.WORKSPACES.BY_ID(id)).pipe(
      tap(() => {
        this._workspaces.update((s) => ({
          ...s,
          data: s.data.filter((w) => w.id !== id),
        }));
        if (this._activeWorkspace()?.id === id) {
          this._activeWorkspace.set(null);
        }
      }),
    );
  }

  clearState(): void {
    this._workspaces.set(initialAsyncState([]));
    this._activeWorkspace.set(null);
    this._activeLoading.set(false);
    this._activeError.set(null);
  }
}
