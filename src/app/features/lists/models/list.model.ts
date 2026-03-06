// ── Responses ────────────────────────────────────────────────────────────────

export interface ListResponse {
  id: string;
  name: string;
  position: number;
  boardId: string;
}

// ── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateListDto {
  name: string;
}

export interface UpdateListDto {
  name?: string;
  position?: number;
}
