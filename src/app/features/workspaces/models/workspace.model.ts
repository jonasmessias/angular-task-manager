import type { BoardResponse } from '../../boards/models/board.model';

// ── Responses ────────────────────────────────────────────────────────────────

export interface WorkspaceResponse {
  id: string;
  name: string;
  boardCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceDetail {
  id: string;
  name: string;
  boards: BoardResponse[];
  createdAt: string;
  updatedAt: string;
}

// ── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateWorkspaceDto {
  name: string;
}

export interface UpdateWorkspaceDto {
  name?: string;
}
