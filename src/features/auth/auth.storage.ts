import Cookies from "js-cookie";

export const AUTH_TOKEN_COOKIE = "auth_token";
export const AUTH_TOKEN_SESSION = "auth_token";
export const AUTH_BOOTSTRAP_KEY = "admin_auth_bootstrap";

export function readStoredToken(): string | null {
  return (
    Cookies.get(AUTH_TOKEN_COOKIE) ||
    sessionStorage.getItem(AUTH_TOKEN_SESSION) ||
    null
  );
}

export function writeStoredToken(token: string): void {
  Cookies.set(AUTH_TOKEN_COOKIE, token, {
    secure: window.location.protocol === "https:",
    sameSite: "strict",
    expires: 7,
  });
  sessionStorage.setItem(AUTH_TOKEN_SESSION, token);
}

export function clearStoredToken(): void {
  Cookies.remove(AUTH_TOKEN_COOKIE);
  sessionStorage.removeItem(AUTH_TOKEN_SESSION);
  sessionStorage.removeItem(AUTH_BOOTSTRAP_KEY);
}

export function markAuthBootstrap(): void {
  sessionStorage.setItem(AUTH_BOOTSTRAP_KEY, "1");
}

export function consumeAuthBootstrap(): boolean {
  const active = sessionStorage.getItem(AUTH_BOOTSTRAP_KEY) === "1";
  if (active) sessionStorage.removeItem(AUTH_BOOTSTRAP_KEY);
  return active;
}

export function isRouterRedirect(err: unknown): err is Response {
  return (
    err instanceof Response &&
    err.status >= 300 &&
    err.status < 400 &&
    err.headers.has("Location")
  );
}
