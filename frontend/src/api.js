const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";

export async function apiRequest(path, options = {}) {
  const { auth = true, ...requestOptions } = options;
  const headers = new Headers(requestOptions.headers);
  headers.set("Content-Type", "application/json");

  const accessToken = localStorage.getItem("accessToken");
  if (auth && accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    headers,
  });

  if (response.status === 401 && auth) {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      clearTokens();
      throw new Error("Сессия истекла. Войдите снова.");
    }

    const refreshResponse = await fetch(`${API_URL}/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!refreshResponse.ok) {
      clearTokens();
      throw new Error("Сессия истекла. Войдите снова.");
    }

    const refreshedTokens = await refreshResponse.json();
    localStorage.setItem("accessToken", refreshedTokens.access);
    if (refreshedTokens.refresh) {
      localStorage.setItem("refreshToken", refreshedTokens.refresh);
    }

    headers.set("Authorization", `Bearer ${refreshedTokens.access}`);
    response = await fetch(`${API_URL}${path}`, {
      ...requestOptions,
      headers,
    });
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(
      errorBody?.detail ?? "Не удалось выполнить запрос. Проверьте данные и повторите.",
    );
  }

  if (response.status === 204) {
    return null;
  }
  return response.json();
}

export function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}
