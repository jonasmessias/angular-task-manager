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
import type {
  InviteMemberDto,
  MemberResponse,
} from '../../features/workspaces/models/member.model';
import { API_ENDPOINTS } from '../constants/api-endpoints.const';
import { StorageKeys } from '../enums/storage-keys.enum';
import { AsyncState, initialAsyncState } from '../interfaces/async-state.interface';

@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  private readonly http = inject(HttpClient);

  // -- State ------------------------------------------------------------------

  private readonly _workspaces = signal<AsyncState<WorkspaceResponse[]>>(initialAsyncState([]));
  private readonly _activeWorkspace = signal<WorkspaceDetail | null>(null);
  private readonly _activeLoading = signal(false);
  private readonly _activeError = signal<string | null>(null);
  private readonly _activeWorkspaceId = signal<string | null>(
    localStorage.getItem(StorageKeys.ACTIVE_WORKSPACE_ID),
  );

  // -- Selectors --------------------------------------------------------------

  readonly workspaces = computed(() => this._workspaces().data);
  readonly workspacesLoading = computed(() => this._workspaces().loading);
  readonly workspacesError = computed(() => this._workspaces().error);

  readonly activeWorkspace = this._activeWorkspace.asReadonly();
  readonly activeLoading = this._activeLoading.asReadonly();
  readonly activeError = this._activeError.asReadonly();
  readonly activeWorkspaceId = this._activeWorkspaceId.asReadonly();

  readonly hasWorkspaces = computed(() => this._workspaces().data.length > 0);
  readonly workspacesLoaded = computed(
    () => !this._workspaces().loading && this._workspaces().error === null,
  );

  // -- Actions ----------------------------------------------------------------

  loadAll(): Observable<WorkspaceResponse[]> {
    this._workspaces.update((s) => ({ ...s, loading: true, error: null }));

    return this.http.get<WorkspaceResponse[]>(API_ENDPOINTS.WORKSPACES.ALL).pipe(
      tap({
        next: (data) => {
          this._workspaces.set({ data, loading: false, error: null });
          // Auto-select first workspace if saved ID is gone
          if (data.length > 0) {
            const savedId = this._activeWorkspaceId();
            const exists = data.some((w) => w.id === savedId);
            if (!exists) {
              this.setActiveWorkspaceId(data[0].id);
            }
          }
        },
        error: (err) =>
          this._workspaces.update((s) => ({
            ...s,
            loading: false,
            error: err?.error?.message ?? 'Failed to load workspaces',
          })),
      }),
    );
  }

  setActiveWorkspaceId(id: string): void {
    this._activeWorkspaceId.set(id);
    localStorage.setItem(StorageKeys.ACTIVE_WORKSPACE_ID, id);
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
          this._activeError.set(err?.error?.message ?? 'Failed to load workspace');
          this._activeLoading.set(false);
        },
      }),
    );
  }

  create(dto: CreateWorkspaceDto): Observable<WorkspaceResponse> {
    return this.http.post<WorkspaceResponse>(API_ENDPOINTS.WORKSPACES.ALL, dto).pipe(
      tap((created) => {
        this._workspaces.update((s) => ({ ...s, data: [...s.data, created] }));
        // Auto-activate newly created workspace if no active one
        if (!this._activeWorkspaceId()) {
          this.setActiveWorkspaceId(created.id);
        }
      }),
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
        const remaining = this._workspaces().data.filter((w) => w.id !== id);
        this._workspaces.update((s) => ({ ...s, data: remaining }));
        if (this._activeWorkspace()?.id === id) {
          this._activeWorkspace.set(null);
        }
        if (this._activeWorkspaceId() === id) {
          const next = remaining[0]?.id ?? null;
          if (next) {
            this.setActiveWorkspaceId(next);
          } else {
            this._activeWorkspaceId.set(null);
            localStorage.removeItem(StorageKeys.ACTIVE_WORKSPACE_ID);
          }
        }
      }),
    );
  }

  // -- Member actions ----------------------------------------------------------

  getMembers(workspaceId: string): Observable<MemberResponse[]> {
    return this.http.get<MemberResponse[]>(API_ENDPOINTS.WORKSPACES.MEMBERS(workspaceId));
  }

  inviteMember(workspaceId: string, dto: InviteMemberDto): Observable<MemberResponse> {
    return this.http.post<MemberResponse>(API_ENDPOINTS.WORKSPACES.MEMBERS(workspaceId), dto);
  }

  removeMember(workspaceId: string, userId: string): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.WORKSPACES.MEMBER(workspaceId, userId));
  }

  clearState(): void {
    this._workspaces.set(initialAsyncState([]));
    this._activeWorkspace.set(null);
    this._activeLoading.set(false);
    this._activeError.set(null);
    this._activeWorkspaceId.set(null);
    localStorage.removeItem(StorageKeys.ACTIVE_WORKSPACE_ID);
  }
}
