export async function usersLoader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const page = url.searchParams.get("page") || "1";
  // Connect to your backend API
  const response = await fetch(`/api/admin/users?page=${page}`);
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
}
