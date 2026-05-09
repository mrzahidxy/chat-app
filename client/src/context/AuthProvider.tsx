import {
  createContext,
  useEffect,
  useMemo,
  useReducer,
  type Dispatch,
  type PropsWithChildren,
} from "react";
import type {
  AuthAction,
  AuthContextValue,
  AuthState,
} from "../types/auth";
import type { AuthenticatedUser } from "../types/user";
import {
  clearStoredUser,
  loadStoredUser,
  saveStoredUser,
} from "../utils/authStorage";
import { setUnauthorizedHandler } from "../utils/requestMethod";

type UserLike = {
  _id?: string;
  id?: string;
  userId?: string;
  username?: string;
  email?: string;
  token?: string;
  accessToken?: string;
  user?: UserLike | null;
};

type RawUserPayload = UserLike | null;

const formatUser = (payload: RawUserPayload): AuthenticatedUser | null => {
  if (!payload) {
    return null;
  }

  const userData = payload.user ?? payload;
  const token = payload.token ?? payload.accessToken ?? null;
  const normalizedId = userData._id ?? userData.id ?? userData.userId ?? null;
  const username = userData.username ?? null;
  const email = userData.email ?? null;

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

const getInitialState = (): AuthState => ({
  currentUser: formatUser(loadStoredUser()),
});

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
  currentUser: null,
  dispatch: (() => undefined) as Dispatch<AuthAction>,
});

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [state, dispatch] = useReducer(AuthReducer, undefined, getInitialState);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      dispatch({ type: "LOGOUT" });
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, [dispatch]);

  useEffect(() => {
    if (state.currentUser) {
      saveStoredUser(state.currentUser);
    } else {
      clearStoredUser();
    }
  }, [state.currentUser]);

  const value = useMemo(
    () => ({ currentUser: state.currentUser, dispatch }),
    [state.currentUser, dispatch]
  );


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
