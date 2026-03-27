/**
 * Converts a string into a URL-safe slug.
 * e.g. "My Workspace!" → "my-workspace"
 */
export function toSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9\s-]/g, '') // remove non-alphanumeric
    .trim()
    .replace(/\s+/g, '-') // spaces → hyphens
    .replace(/-+/g, '-'); // collapse multiple hyphens
}

/**
 * Builds the boards URL for a given username: /u/<username>/boards
 */
export function boardsPath(username: string): string[] {
  return ['/u', username, 'boards'];
}

/**
 * Builds the board URL segment: /b/<boardId>/<boardSlug>
 */
export function boardPath(boardId: string, boardName: string): string[] {
  return ['/b', boardId, toSlug(boardName)];
}

/**
 * Builds the workspace base segment: <workspaceSlug>-<workspaceId>
 * e.g. "My Space" + "abc123" → "my-space-abc123"
 */
export function workspaceSegment(workspaceId: string, workspaceName: string): string {
  return `${toSlug(workspaceName)}-${workspaceId}`;
}

/**
 * Builds the workspace home URL: /w/<slug-id>/home
 */
export function workspaceHomePath(workspaceId: string, workspaceName: string): string[] {
  return ['/w', workspaceSegment(workspaceId, workspaceName), 'home'];
}

/**
 * Builds the workspace settings URL: /w/<slug-id>/account
 */
export function workspaceAccountPath(workspaceId: string, workspaceName: string): string[] {
  return ['/w', workspaceSegment(workspaceId, workspaceName), 'account'];
}

/**
 * Builds the workspace members URL: /w/<slug-id>/members
 */
export function workspaceMembersPath(workspaceId: string, workspaceName: string): string[] {
  return ['/w', workspaceSegment(workspaceId, workspaceName), 'members'];
}
