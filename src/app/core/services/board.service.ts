import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs';

import type {
  BoardDetail,
  BoardResponse,
  CreateBoardDto,
  UpdateBoardDto,
} from '../../features/boards/models/board.model';
import type {
  CardResponse,
  CreateCardDto,
  UpdateCardDto,
} from '../../features/cards/models/card.model';
import type { CreateListDto, UpdateListDto } from '../../features/lists/models/list.model';
import { API_ENDPOINTS } from '../constants/api-endpoints.const';
import { AsyncState, initialAsyncState } from '../interfaces/async-state.interface';

@Injectable({ providedIn: 'root' })
export class BoardService {
  private readonly http = inject(HttpClient);

  // -- State ------------------------------------------------------------------

  private readonly _boards = signal<AsyncState<BoardResponse[]>>(initialAsyncState([]));
  private readonly _activeBoard = signal<BoardDetail | null>(null);
  private readonly _activeBoardLoading = signal(false);
  private readonly _activeBoardError = signal<string | null>(null);

  // -- Selectors --------------------------------------------------------------

  readonly boards = computed(() => this._boards().data);
  readonly boardsLoading = computed(() => this._boards().loading);
  readonly boardsError = computed(() => this._boards().error);

  readonly activeBoard = this._activeBoard.asReadonly();
  readonly activeBoardLoading = this._activeBoardLoading.asReadonly();
  readonly activeBoardError = this._activeBoardError.asReadonly();

  readonly lists = computed(() =>
    (this._activeBoard()?.lists ?? []).slice().sort((a, b) => a.position - b.position),
  );

  // -- Board actions ----------------------------------------------------------

  loadAll(workspaceId: string): Observable<BoardResponse[]> {
    this._boards.update((s) => ({ ...s, loading: true, error: null }));
    const params = new HttpParams().set('workspaceId', workspaceId);

    return this.http.get<BoardResponse[]>(API_ENDPOINTS.BOARDS.ALL, { params }).pipe(
      tap({
        next: (data) => this._boards.set({ data, loading: false, error: null }),
        error: (err) =>
          this._boards.update((s) => ({
            ...s,
            loading: false,
            error: err?.error?.message ?? 'Erro ao carregar boards',
          })),
      }),
    );
  }

  openBoard(id: string): Observable<BoardDetail> {
    this._activeBoardLoading.set(true);
    this._activeBoardError.set(null);
    this._activeBoard.set(null);

    return this.http.get<BoardDetail>(API_ENDPOINTS.BOARDS.BY_ID(id)).pipe(
      tap({
        next: (data) => {
          this._activeBoard.set(data);
          this._activeBoardLoading.set(false);
        },
        error: (err) => {
          this._activeBoardError.set(err?.error?.message ?? 'Erro ao carregar board');
          this._activeBoardLoading.set(false);
        },
      }),
    );
  }

  closeBoard(): void {
    this._activeBoard.set(null);
    this._activeBoardError.set(null);
  }

  create(workspaceId: string, dto: CreateBoardDto): Observable<BoardResponse> {
    const params = new HttpParams().set('workspaceId', workspaceId);
    return this.http
      .post<BoardResponse>(API_ENDPOINTS.BOARDS.ALL, dto, { params })
      .pipe(tap((created) => this._boards.update((s) => ({ ...s, data: [...s.data, created] }))));
  }

  update(id: string, dto: UpdateBoardDto): Observable<BoardResponse> {
    return this.http.put<BoardResponse>(API_ENDPOINTS.BOARDS.BY_ID(id), dto).pipe(
      tap((updated) => {
        this._boards.update((s) => ({
          ...s,
          data: s.data.map((b) => (b.id === id ? updated : b)),
        }));
        if (this._activeBoard()?.id === id) {
          this._activeBoard.update((b) => (b ? { ...b, ...updated } : b));
        }
      }),
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.BOARDS.BY_ID(id)).pipe(
      tap(() => {
        this._boards.update((s) => ({
          ...s,
          data: s.data.filter((b) => b.id !== id),
        }));
        if (this._activeBoard()?.id === id) {
          this._activeBoard.set(null);
        }
      }),
    );
  }

  // -- List actions -----------------------------------------------------------

  addList(
    boardId: string,
    dto: CreateListDto,
  ): Observable<import('../../features/lists/models/list.model').ListResponse> {
    return this.http
      .post<
        import('../../features/lists/models/list.model').ListResponse
      >(API_ENDPOINTS.LISTS.ALL(boardId), dto)
      .pipe(
        tap((created) =>
          this._activeBoard.update((board) => {
            if (!board) return board;
            const newList = { ...created, cards: [] };
            return { ...board, lists: [...board.lists, newList] };
          }),
        ),
      );
  }

  updateList(
    boardId: string,
    listId: string,
    dto: UpdateListDto,
  ): Observable<import('../../features/lists/models/list.model').ListResponse> {
    return this.http
      .put<
        import('../../features/lists/models/list.model').ListResponse
      >(API_ENDPOINTS.LISTS.BY_ID(boardId, listId), dto)
      .pipe(
        tap((updated) =>
          this._activeBoard.update((board) => {
            if (!board) return board;
            return {
              ...board,
              lists: board.lists.map((l) => (l.id === listId ? { ...l, ...updated } : l)),
            };
          }),
        ),
      );
  }

  deleteList(boardId: string, listId: string): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.LISTS.BY_ID(boardId, listId)).pipe(
      tap(() =>
        this._activeBoard.update((board) => {
          if (!board) return board;
          return {
            ...board,
            lists: board.lists.filter((l) => l.id !== listId),
          };
        }),
      ),
    );
  }

  // -- Card actions -----------------------------------------------------------

  addCard(boardId: string, listId: string, dto: CreateCardDto): Observable<CardResponse> {
    return this.http.post<CardResponse>(API_ENDPOINTS.CARDS.ALL(boardId, listId), dto).pipe(
      tap((created) =>
        this._activeBoard.update((board) => {
          if (!board) return board;
          return {
            ...board,
            lists: board.lists.map((l) =>
              l.id === listId ? { ...l, cards: [...l.cards, created] } : l,
            ),
          };
        }),
      ),
    );
  }

  updateCard(
    boardId: string,
    listId: string,
    cardId: string,
    dto: UpdateCardDto,
  ): Observable<CardResponse> {
    return this.http
      .put<CardResponse>(API_ENDPOINTS.CARDS.BY_ID(boardId, listId, cardId), dto)
      .pipe(
        tap((updated) =>
          this._activeBoard.update((board) => {
            if (!board) return board;
            return {
              ...board,
              lists: board.lists.map((l) =>
                l.id === listId
                  ? {
                      ...l,
                      cards: l.cards.map((c) => (c.id === cardId ? updated : c)),
                    }
                  : l,
              ),
            };
          }),
        ),
      );
  }

  /**
   * Moves a card between lists with an optimistic update:
   * local state is updated before the API confirms.
   */
  moveCard(
    boardId: string,
    cardId: string,
    fromListId: string,
    toListId: string,
    newPosition: number,
  ): Observable<CardResponse> {
    this._activeBoard.update((board) => {
      if (!board) return board;
      const fromList = board.lists.find((l) => l.id === fromListId);
      const card = fromList?.cards.find((c) => c.id === cardId);
      if (!card) return board;

      return {
        ...board,
        lists: board.lists.map((l) => {
          if (l.id === fromListId) {
            return { ...l, cards: l.cards.filter((c) => c.id !== cardId) };
          }
          if (l.id === toListId) {
            const updated = { ...card, listId: toListId, position: newPosition };
            const inserted = [...l.cards, updated].sort((a, b) => a.position - b.position);
            return { ...l, cards: inserted };
          }
          return l;
        }),
      };
    });

    return this.http.patch<CardResponse>(API_ENDPOINTS.CARDS.MOVE(boardId, fromListId, cardId), {
      targetListId: toListId,
      position: newPosition,
    });
  }

  deleteCard(boardId: string, listId: string, cardId: string): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.CARDS.BY_ID(boardId, listId, cardId)).pipe(
      tap(() =>
        this._activeBoard.update((board) => {
          if (!board) return board;
          return {
            ...board,
            lists: board.lists.map((l) =>
              l.id === listId ? { ...l, cards: l.cards.filter((c) => c.id !== cardId) } : l,
            ),
          };
        }),
      ),
    );
  }

  clearState(): void {
    this._boards.set(initialAsyncState([]));
    this._activeBoard.set(null);
    this._activeBoardLoading.set(false);
    this._activeBoardError.set(null);
  }
}
