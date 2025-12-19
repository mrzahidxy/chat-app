import axios, { type AxiosInstance } from "axios";
import type { AuthenticatedUser } from "../types/user";
import { API_BASE_URL } from "../config/env";

type StoredUser = Partial<AuthenticatedUser> & {
  accessToken?: string;
  id?: string;
  userId?: string;
};

const readStoredUser = (): StoredUser | null => {
  try {
    const value = localStorage.getItem("currentUser");
    return value ? (JSON.parse(value) as StoredUser) : null;
  } catch {
    return null;
  }
};

const getToken = (): string | null => {
  const storedUser = readStoredUser();
  if (!storedUser) {
    return null;
  }

  if (storedUser.token) {
    return storedUser.token;
  }

  if (storedUser.accessToken) {
    return storedUser.accessToken;
  }

  return null;
};

export const publicRequest: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

export const privateRequest: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

privateRequest.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
