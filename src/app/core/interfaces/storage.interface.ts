// ── Responses ────────────────────────────────────────────────────────────────

export interface UploadResponse {
  fileUrl: string;
}

export interface PresignedUploadResponse {
  uploadUrl: string;
  fileKey: string;
  fileUrl: string;
}

// ── DTOs ─────────────────────────────────────────────────────────────────────

export interface PresignedUploadDto {
  fileName: string;
  contentType: string;
  fileSize: number;
}

export interface DeleteFileDto {
  fileUrl: string;
}
