const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success?: boolean; message: string; data?: T } & T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    let data;
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      throw new Error(`Request failed with status ${response.status}: ${response.statusText}`);
    }

    // Log response for debugging (remove in production)
    if (process.env.NODE_ENV === "development") {
      console.log(`API ${options.method || "GET"} ${endpoint}:`, {
        status: response.status,
        ok: response.ok,
        data,
      });
    }

    if (!response.ok) {
      if (response.status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      }
      let errorMessage = data.message || data.error || `Request failed with status ${response.status}`;
      
      if (data.errors && Array.isArray(data.errors)) {
        const errorDetails = data.errors.map((err: any) => 
          `${err.field || err.path || err.param}: ${err.message || err.msg || err}`
        ).join(", ");
        errorMessage = `Validation error: ${errorDetails}`;
      } else if (data.error && typeof data.error === "object") {
        errorMessage = JSON.stringify(data.error);
      } else if (data.details) {
        errorMessage = `${errorMessage}. Details: ${JSON.stringify(data.details)}`;
      }
      
      console.error("API Error Response:", data);
      throw new Error(errorMessage);
    }

    return data;
  } catch (error: any) {
    throw new Error(error.message || "Network error");
  }
}

