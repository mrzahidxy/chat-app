import axios, { type AxiosInstance } from "axios";
import { API_BASE_URL } from "../config/env";
import { getStoredToken } from "./authStorage";

export const publicRequest: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

export const privateRequest: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

type UnauthorizedHandler = (() => void) | null;

let unauthorizedHandler: UnauthorizedHandler = null;

export const setUnauthorizedHandler = (
  handler: UnauthorizedHandler
): void => {
  unauthorizedHandler = handler;
};

privateRequest.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

privateRequest.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  }
);
