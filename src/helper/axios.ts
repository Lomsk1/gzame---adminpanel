import axios from "axios";
import Cookies from "js-cookie";
import { BASE_URL } from "../config/env.config";

const getAuthToken = () => {
  const token = Cookies.get("auth_token");
  return token ? token : null;
};

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

const axiosAuth = axiosInstance;

axiosAuth.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("auth_token");

      // Only redirect if NOT already on the login page
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
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
