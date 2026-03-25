import type { ListWithCards } from '../../lists/models/list.model';

// ── Responses ────────────────────────────────────────────────────────────────

export type BoardType = 'BOARD';

export interface BoardResponse {
  id: string;
  name: string;
  type: BoardType;
  description: string;
  coverUrl: string | null;
  ownerId: string;
  ownerName: string;
  listsCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Full board returned when opening a board — includes lists with their cards */
export interface BoardDetail extends Omit<BoardResponse, 'listsCount'> {
  lists: ListWithCards[];
}

// ── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateBoardDto {
  name: string;
  type?: BoardType;
  description?: string;
}

export interface UpdateBoardDto {
  name?: string;
  type?: BoardType;
  description?: string;
}
