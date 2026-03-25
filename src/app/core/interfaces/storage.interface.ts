// ── Responses ────────────────────────────────────────────────────────────────

export interface UploadResponse {
  fileKey: string;
  fileUrl: string;
}

export interface PresignedUploadResponse {
  uploadUrl: string;
  fileKey: string;
}

// ── DTOs ─────────────────────────────────────────────────────────────────────

export interface PresignedUploadDto {
  fileName: string;
  contentType: string;
}

export interface DeleteFileDto {
  fileKey: string;
}
