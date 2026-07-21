export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });
  
  if (response.status === 401) {
    // Optional: handle token expiration globally
    localStorage.removeItem("token");
    window.location.href = "/login";
  }
  
  return response;
}
