import type { AssetStatus } from "./types";

export function formatMoney(n: number | string | undefined | null) {
  const v = Number(n || 0);
  return v.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function statusTone(
  s: AssetStatus
): "green" | "yellow" | "red" | "gray" | "blue" {
  const statusMap: Record<AssetStatus, "green" | "yellow" | "red" | "gray" | "blue"> = {
    IN_SERVICE: "green",
    CAPITALIZED: "green",
    DRAFT: "yellow",
    DISPOSED: "gray",
    IMPAIRED: "red",
  };
  return statusMap[s] || "blue";
}

export async function downloadFile(
  url: string,
  filename: string,
  useAuth: boolean = false
) {
  if (useAuth) {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Authenticated download error:", error);
      alert("Failed to download file. Please try again.");
    }
  } else {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
}
