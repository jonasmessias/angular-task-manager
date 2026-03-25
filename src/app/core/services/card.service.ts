import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs';

import type {
  AttachmentResponse,
  ConfirmAttachmentDto,
  RequestUploadDto,
  RequestUploadResponse,
} from '../../features/cards/models/attachment.model';
import type {
  CardResponse,
  CreateCardDto,
  UpdateCardDto,
} from '../../features/cards/models/card.model';
import { API_ENDPOINTS } from '../constants/api-endpoints.const';

/**
 * Manages the card open in detail view (modal/sheet).
 * Board operations (create, move, delete) are handled by BoardService.
 */
@Injectable({ providedIn: 'root' })
export class CardService {
  private readonly http = inject(HttpClient);

  // -- State ------------------------------------------------------------------

  private readonly _activeCard = signal<CardResponse | null>(null);
  private readonly _activeCardLoading = signal(false);
  private readonly _activeCardError = signal<string | null>(null);

  // -- Selectors --------------------------------------------------------------

  readonly activeCard = this._activeCard.asReadonly();
  readonly activeCardLoading = this._activeCardLoading.asReadonly();
  readonly activeCardError = this._activeCardError.asReadonly();

  // -- Actions ----------------------------------------------------------------

  openCard(boardId: string, listId: string, cardId: string): Observable<CardResponse> {
    this._activeCardLoading.set(true);
    this._activeCardError.set(null);

    return this.http.get<CardResponse>(API_ENDPOINTS.CARDS.BY_ID(boardId, listId, cardId)).pipe(
      tap({
        next: (card) => {
          this._activeCard.set(card);
          this._activeCardLoading.set(false);
        },
        error: (err) => {
          this._activeCardError.set(err?.error?.message ?? 'Failed to load card');
          this._activeCardLoading.set(false);
        },
      }),
    );
  }

  closeCard(): void {
    this._activeCard.set(null);
    this._activeCardError.set(null);
  }

  // -- HTTP (stateless) -------------------------------------------------------

  getAll(boardId: string, listId: string): Observable<CardResponse[]> {
    return this.http.get<CardResponse[]>(API_ENDPOINTS.CARDS.ALL(boardId, listId));
  }

  create(boardId: string, listId: string, dto: CreateCardDto): Observable<CardResponse> {
    return this.http.post<CardResponse>(API_ENDPOINTS.CARDS.ALL(boardId, listId), dto);
  }

  update(
    boardId: string,
    listId: string,
    cardId: string,
    dto: UpdateCardDto,
  ): Observable<CardResponse> {
    return this.http.put<CardResponse>(API_ENDPOINTS.CARDS.BY_ID(boardId, listId, cardId), dto);
  }

  delete(boardId: string, listId: string, cardId: string): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.CARDS.BY_ID(boardId, listId, cardId));
  }

  // -- Attachment actions ------------------------------------------------------

  getAttachments(cardId: string): Observable<AttachmentResponse[]> {
    return this.http.get<AttachmentResponse[]>(API_ENDPOINTS.ATTACHMENTS.ALL(cardId));
  }

  requestUpload(cardId: string, dto: RequestUploadDto): Observable<RequestUploadResponse> {
    return this.http.post<RequestUploadResponse>(
      API_ENDPOINTS.ATTACHMENTS.REQUEST_UPLOAD(cardId),
      dto,
    );
  }

  confirmAttachment(cardId: string, dto: ConfirmAttachmentDto): Observable<AttachmentResponse> {
    return this.http.post<AttachmentResponse>(API_ENDPOINTS.ATTACHMENTS.CONFIRM(cardId), dto);
  }

  deleteAttachment(cardId: string, attachmentId: string): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.ATTACHMENTS.BY_ID(cardId, attachmentId));
  }
}
