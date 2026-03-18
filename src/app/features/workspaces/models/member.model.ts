// ── Responses ────────────────────────────────────────────────────────────────

export interface MemberResponse {
  id: string;
  userId: string;
  name: string;
  username: string;
  email: string;
  role: MemberRole;
  joinedAt: string;
}

export type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER';

// ── DTOs ─────────────────────────────────────────────────────────────────────

export interface InviteMemberDto {
  emailOrUsername: string;
}
