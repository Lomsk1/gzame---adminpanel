export const BASE_URL =
  import.meta.env.VITE_APP_BASE_URL ||
  (import.meta.env.DEV ? "http://localhost:8000" : "");

if (!BASE_URL && import.meta.env.PROD) {
  console.error(
    "[GzaMe Admin] VITE_APP_BASE_URL is missing — API calls will fail. Set it in Vercel env vars.",
  );
}
