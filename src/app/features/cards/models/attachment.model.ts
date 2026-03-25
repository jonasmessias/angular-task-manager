// ── Responses ────────────────────────────────────────────────────────────────

export interface AttachmentResponse {
  id: string;
  fileName: string;
  fileKey: string;
  fileUrl: string;
  fileSize: number;
  contentType: string;
  cardId: string;
  uploadedById: string;
  createdAt: string;
}

export interface RequestUploadResponse {
  uploadUrl: string;
  fileKey: string;
}

// ── DTOs ─────────────────────────────────────────────────────────────────────

export interface RequestUploadDto {
  fileName: string;
  contentType: string;
  fileSize: number;
}

export interface ConfirmAttachmentDto {
  fileName: string;
  fileKey: string;
  contentType: string;
  fileSize: number;
}
