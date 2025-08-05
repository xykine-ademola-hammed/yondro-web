export const baseUrl = import.meta.env.VITE_API_URL;

export const baseUrls = {
  main: baseUrl,
};

const getHeader = (includeToken: boolean): HeadersInit => {
  const token = localStorage.getItem("token");
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
  const headers = getHeader(includeToken);
  const response = await fetch(`${baseUrl}${urlPath}`, {
    method,
    headers,
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok) {
    throw { response: { status: response.status, data } };
  }
  return data;
};
