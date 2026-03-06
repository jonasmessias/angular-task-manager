import type { CardResponse } from '../../cards/models/card.model';

// ── Responses ────────────────────────────────────────────────────────────────

export interface ListResponse {
  id: string;
  name: string;
  position: number;
  boardId: string;
}

/** List with embedded cards — used inside BoardDetail */
export interface ListWithCards extends ListResponse {
  cards: CardResponse[];
}

// ── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateListDto {
  name: string;
}

export interface UpdateListDto {
  name?: string;
  position?: number;
}
