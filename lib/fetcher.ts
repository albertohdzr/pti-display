// lib/fetcher.ts
export async function fetcher<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const defaultOptions: RequestInit = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = await fetch(url, {
    ...defaultOptions,
    ...options,
  });

  if (!response.ok) {
    const error = new Error("An error occurred while fetching the data.");
    // Agregar información extra al error
    const data = await response.json().catch(() => ({}));

    (error as any).info = data;
    (error as any).status = response.status;
    throw error;
  }

  return response.json();
}
