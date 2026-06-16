import { API_BASE_URL } from "../../services/api";

export type ApiError = {
  message: string;
  status?: number;
  details?: unknown;
};

async function parseError(res: Response): Promise<ApiError> {
  let body: any = null;
  try {
    body = await res.json();
  } catch {
    // ignore
  }
  return {
    message: body?.message ?? res.statusText ?? "Request failed",
    status: res.status,
    details: body,
  };
}

export async function api<T>(
  path: string,
  opts: RequestInit & {
    query?: Record<string, string | number | boolean | undefined | null>;
  } = {}
): Promise<T> {
  const url = new URL(API_BASE_URL + path);

  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (v === undefined || v === null) continue;
      url.searchParams.set(k, String(v));
    }
  }

  const res = await fetch(url.toString(), {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers ?? {}),
    },
    credentials: "include", // if you use cookies/session
  });

  if (!res.ok) throw await parseError(res);

  // If endpoint returns file, do not use this helper
  return (await res.json()) as T;
}

export async function apiBlob(
  path: string,
  opts: RequestInit & {
    query?: Record<string, string | number | boolean | undefined | null>;
  } = {}
): Promise<Blob> {
  const url = new URL(API_BASE_URL + path);
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (v === undefined || v === null) continue;
      url.searchParams.set(k, String(v));
    }
  }

  const res = await fetch(url.toString(), {
    ...opts,
    headers: { ...(opts.headers ?? {}) },
    credentials: "include",
  });

  if (!res.ok) {
    const err = await (async () => {
      try {
        return await res.json();
      } catch {
        return { message: res.statusText };
      }
    })();
    throw {
      message: err.message ?? res.statusText,
      status: res.status,
      details: err,
    } as ApiError;
  }

  return await res.blob();
}
