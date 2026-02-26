import axios from "axios";
import type { AxiosResponse, AxiosError } from "axios";
import Cookies from "js-cookie";
import { BASE_URL } from "../config/env.config";

const getAuthToken = () => {
  const token = Cookies.get("auth_token");
  return token ? token : null;
};

const INVALID_SIGNATURE_PATTERNS = [
  "invalid signature",
  "jwt signature",
  "invalid token",
  "jwt malformed",
  "invalid algorithm",
  "jwt expired",
  "invalid jwt",
];

function isInvalidSignatureError(error: unknown): boolean {
  const message =
    (axios.isAxiosError(error) && (error.response?.data?.message ?? error.message)) ||
    (error instanceof Error && error.message) ||
    String(error);
  const lower = message.toLowerCase();
  return INVALID_SIGNATURE_PATTERNS.some((p) => lower.includes(p));
}

function clearAuthAndRedirect(): void {
  Cookies.remove("auth_token");
  if (!window.location.pathname.includes("/login")) {
    window.location.href = "/login";
  }
}

/* Auth */

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const authTokens = getAuthToken();
  if (authTokens) {
    config.headers.Authorization = `Bearer ${authTokens}`;
  }
  return config;
});

const authResponseInterceptor = (
  response: AxiosResponse
): AxiosResponse => response;

const authResponseErrorInterceptor = (error: AxiosError): Promise<never> => {
  const shouldClearAuth =
    error.response?.status === 401 || isInvalidSignatureError(error);

  if (shouldClearAuth) {
    clearAuthAndRedirect();
  }

  return Promise.reject(error);
};

const axiosAuth = axiosInstance;

axiosAuth.interceptors.response.use(
  authResponseInterceptor,
  authResponseErrorInterceptor
);

export default axiosAuth;

export const axiosMultipartAuth = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
  withCredentials: true,
});

axiosMultipartAuth.interceptors.request.use((config) => {
  const authTokens = getAuthToken();
  if (authTokens) {
    config.headers.Authorization = `Bearer ${authTokens}`;
  }
  return config;
});

axiosMultipartAuth.interceptors.response.use(
  authResponseInterceptor,
  authResponseErrorInterceptor
);

/* Publics */

export const axiosMultipart = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
  withCredentials: true,
});

export const axiosPublic = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});
