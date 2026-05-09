import type { AuthResponse } from "../types/auth";
import type { AuthenticatedUser } from "../types/user";

const CURRENT_USER_KEY = "currentUser";

export type StoredUser = Partial<AuthenticatedUser> &
  Partial<AuthResponse> & {
    accessToken?: string;
    id?: string;
    userId?: string;
    user?: Partial<AuthenticatedUser> | null;
  };

export const loadStoredUser = (): StoredUser | null => {
  try {
    const value = localStorage.getItem(CURRENT_USER_KEY);
    return value ? (JSON.parse(value) as StoredUser) : null;
  } catch {
    localStorage.removeItem(CURRENT_USER_KEY);
    return null;
  }
};

export const getStoredToken = (): string | null => {
  const storedUser = loadStoredUser();
  if (!storedUser) {
    return null;
  }

  return storedUser.token || storedUser.accessToken || null;
};

export const saveStoredUser = (user: AuthenticatedUser): void => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

export const clearStoredUser = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};
