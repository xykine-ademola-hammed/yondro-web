export const baseUrl = import.meta.env.VITE_API_URL;

export const baseUrls = {
  main: baseUrl,
};

/**
 * Always returns a plain object so we can safely manipulate keys.
 */
const getHeader = (includeToken: boolean): Record<string, string> => {
  const token = localStorage.getItem("accessToken");
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  if (includeToken && token) {
    headers.Authorization = "Bearer " + token;
  }

  return headers;
};

export const getQueryMethod = async (
  urlPath: string,
  includeToken: boolean = true
) => {
  const headers = getHeader(includeToken);

  const response = await fetch(`${baseUrl}${urlPath}`, {
    method: "GET",
    headers,
  });
  const data = await response.json();
  if (!response.ok) {
    throw { response: { status: response.status, data } };
  }
  return data;
};

export const getMutationMethod = async (
  method: string,
  urlPath: string,
  body: any,
  includeToken: boolean = true
) => {
  // Use a string-keyed headers object.
  const headers = getHeader(includeToken);
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;
  // Copy headers to avoid mutating the shared headers object.
  const fetchHeaders: Record<string, string> = { ...headers };

  // Remove 'Content-Type' if we're sending FormData; browser will set it.
  if (isFormData) {
    delete fetchHeaders["Content-Type"];
  }

  const fetchOptions: RequestInit = {
    method,
    headers: fetchHeaders,
    body: isFormData ? body : JSON.stringify(body),
  };

  const response = await fetch(`${baseUrl}${urlPath}`, fetchOptions);

  const data = await response.json();
  if (!response.ok) {
    throw { response: { status: response.status, data } };
  }
  return data;
};
