import { publicRequest } from "../utils/requestMethod";
import type { AuthResponse, LoginPayload, SignupPayload } from "../types/auth";
import type { AxiosResponse } from "axios";

const login = (
  payload: LoginPayload
): Promise<AxiosResponse<AuthResponse>> =>
  publicRequest.post<AuthResponse>("/auth/login", payload);

const signup = (
  payload: SignupPayload
): Promise<AxiosResponse<AuthResponse>> =>
  publicRequest.post<AuthResponse>("/auth/signup", payload);

const authServices = { login, signup };

export default authServices;
