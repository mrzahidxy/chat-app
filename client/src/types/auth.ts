import type { Dispatch } from "react";
import type { AuthenticatedUser } from "./user";

export type AuthMode = "login" | "signup";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface SignupPayload {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id?: string;
    _id?: string;
    username: string;
    email: string;
  };
  token: string;
}

export interface AuthFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthState {
  currentUser: AuthenticatedUser | null;
}

export type AuthAction =
  | { type: "LOGIN"; payload: AuthResponse | AuthenticatedUser | null }
  | { type: "LOGOUT" };

export interface AuthContextValue extends AuthState {
  dispatch: Dispatch<AuthAction>;
}
