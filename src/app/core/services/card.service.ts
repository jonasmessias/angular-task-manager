import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_ENDPOINTS } from '../constants/api-endpoints.const';
import type {
  CardResponse,
  CreateCardDto,
  UpdateCardDto,
} from '../../features/cards/models/card.model';

@Injectable({ providedIn: 'root' })
export class CardService {
  private readonly http = inject(HttpClient);

  getAll(boardId: string, listId: string): Observable<CardResponse[]> {
    return this.http.get<CardResponse[]>(API_ENDPOINTS.CARDS.ALL(boardId, listId));
  }

  getById(boardId: string, listId: string, cardId: string): Observable<CardResponse> {
    return this.http.get<CardResponse>(API_ENDPOINTS.CARDS.BY_ID(boardId, listId, cardId));
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
}
