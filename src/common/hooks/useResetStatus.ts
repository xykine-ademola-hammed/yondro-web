import { useState, useEffect, useCallback } from "react";
import { baseUrl } from "../api-methods";

interface ResetStatus {
  valid: boolean;
  remainingSec: number;
}

interface UseResetStatusResult {
  status: ResetStatus;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const API_BASE = `${baseUrl}api/auth`;

const POLL_INTERVAL = 12000; // 12 seconds

export function useResetStatus(
  shouldPoll: boolean = true
): UseResetStatusResult {
  const [status, setStatus] = useState<ResetStatus>({
    valid: false,
    remainingSec: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/reset/status`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.ok) {
        setStatus({ valid: true, remainingSec: data.remainingSec });
        setError(null);
      } else {
        setStatus({ valid: false, remainingSec: 0 });
        setError("Failed to check reset status");
      }
    } catch (err) {
      setStatus({ valid: false, remainingSec: 0 });
      setError("Network error");
    }
  }, []);

  useEffect(() => {
    if (shouldPoll) {
      fetchStatus();

      const interval = setInterval(fetchStatus, POLL_INTERVAL);

      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [fetchStatus, shouldPoll]);

  return {
    status,
    loading,
    error,
    refetch: fetchStatus,
  };
}
