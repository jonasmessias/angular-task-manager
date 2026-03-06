import type { ListResponse } from '../../lists/models/list.model';

// ── Responses ────────────────────────────────────────────────────────────────

export type BoardType = 'BOARD';

export interface BoardResponse {
  id: string;
  name: string;
  type: BoardType;
  description: string;
  ownerId: string;
  ownerName: string;
  listsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BoardDetail extends Omit<BoardResponse, 'listsCount'> {
  lists: ListResponse[];
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
