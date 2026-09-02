import axios from "axios";
import type { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from "axios";
import { BASE_URL } from "../config/env.config";
import useUserStore from "../store/user/user";
import { clearStoredToken, readStoredToken } from "../features/auth/auth.storage";

const getAuthToken = () => {
  const token = readStoredToken() || useUserStore.getState().token;
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

function clearAuthStateOnly(): void {
  clearStoredToken();
  useUserStore.setState({ user: null, token: null });
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
    // Do not hard-navigate here — React Router loaders/actions handle redirects.
    clearAuthStateOnly();
  }

  return Promise.reject(error);
};

const axiosAuth = axiosInstance;

axiosAuth.interceptors.response.use(
  authResponseInterceptor,
  authResponseErrorInterceptor
);

export default axiosAuth;

function attachMultipartHeaders(config: InternalAxiosRequestConfig) {
  const authTokens = getAuthToken();
  if (authTokens) {
    config.headers.Authorization = `Bearer ${authTokens}`;
  }
  // Let the browser set multipart boundary — a bare multipart/form-data breaks uploads.
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
    delete config.headers["content-type"];
  }
  return config;
}

export const axiosMultipartAuth = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

axiosMultipartAuth.interceptors.request.use(attachMultipartHeaders);

axiosMultipartAuth.interceptors.response.use(
  authResponseInterceptor,
  authResponseErrorInterceptor
);

/* Publics */

export const axiosMultipart = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

axiosMultipart.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
    delete config.headers["content-type"];
  }
  return config;
});

export const axiosPublic = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});
