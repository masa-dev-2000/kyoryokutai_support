export const DEFAULT_ROLE_HOME_PATH = "/member";

export const ROLE_HOME_PATHS: Record<string, string> = {
  super: "/super",
  admin: "/admin",
  manager: "/manager",
  member: DEFAULT_ROLE_HOME_PATH,
};

export function homePathForRole(role: string | null | undefined): string {
  return ROLE_HOME_PATHS[role ?? ""] ?? DEFAULT_ROLE_HOME_PATH;
}

export function safeRelativePath(path: string | null | undefined): string | null {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return null;
  return path;
}
