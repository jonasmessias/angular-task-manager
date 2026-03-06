// ── Enums ─────────────────────────────────────────────────────────────────────

export type CardStatus = 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';

// ── Responses ────────────────────────────────────────────────────────────────

export interface CardResponse {
  id: string;
  name: string;
  description: string;
  status: CardStatus;
  position: number;
  listId: string;
  listName: string;
  createdAt: string;
  updatedAt: string;
}

// ── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateCardDto {
  name: string;
  description?: string;
  status?: CardStatus;
  position?: number;
}

export interface UpdateCardDto {
  name?: string;
  description?: string;
  status?: CardStatus;
  position?: number;
}

export interface MoveCardDto {
  targetListId: string;
  position?: number;
}
