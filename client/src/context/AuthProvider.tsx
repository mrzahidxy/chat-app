import {
  createContext,
  useEffect,
  useReducer,
  type Dispatch,
  type PropsWithChildren,
} from "react";
import type {
  AuthAction,
  AuthContextValue,
  AuthResponse,
  AuthState,
} from "../types/auth";
import type { AuthenticatedUser } from "../types/user";

type RawUserPayload =
  | AuthResponse
  | (Partial<AuthenticatedUser> & {
      user?: Partial<AuthenticatedUser> | null;
      accessToken?: string;
      id?: string;
      userId?: string;
    })
  | null
  | undefined;

const formatUser = (payload: RawUserPayload): AuthenticatedUser | null => {
  if (!payload) {
    return null;
  }

  const userData =
    typeof payload === "object" && "user" in payload && payload.user
      ? payload.user
      : payload;

  const token =
    (payload as AuthenticatedUser)?.token ||
    (payload as { accessToken?: string })?.accessToken ||
    (payload as AuthResponse)?.token ||
    null;

  const normalizedId =
    (userData as AuthenticatedUser | undefined)?._id ||
    (userData as { id?: string })?.id ||
    (userData as { userId?: string })?.userId ||
    null;

  const username = (userData as AuthenticatedUser | undefined)?.username;
  const email = (userData as AuthenticatedUser | undefined)?.email;

  if (!token || !normalizedId || !username || !email) {
    return null;
  }

  return {
    username,
    email,
    _id: String(normalizedId),
    token,
  };
};

const loadInitialUser = (): AuthenticatedUser | null => {
  try {
    const stored = localStorage.getItem("currentUser");
    return stored ? formatUser(JSON.parse(stored)) : null;
  } catch {
    localStorage.removeItem("currentUser");
    return null;
  }
};

const InitialState: AuthState = {
  currentUser: loadInitialUser(),
};

const AuthReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN":
      return { currentUser: formatUser(action.payload) };
    case "LOGOUT":
      return { currentUser: null };
    default:
      return state;
  }
};

export const AuthContext = createContext<AuthContextValue>({
  currentUser: InitialState.currentUser,
  dispatch: (() => undefined) as Dispatch<AuthAction>,
});

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [state, dispatch] = useReducer(AuthReducer, InitialState);

  useEffect(() => {
    if (state.currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(state.currentUser));
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [state.currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser: state.currentUser, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};
