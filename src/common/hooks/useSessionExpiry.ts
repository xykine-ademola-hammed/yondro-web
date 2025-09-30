import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../GlobalContexts/AuthContext";

interface UseSessionExpiryResult {
  showWarning: boolean;
  timeRemaining: number;
  formattedTime: string;
  extendSession: () => void;
  dismissWarning: () => void;
}

const WARNING_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry
const CHECK_INTERVAL = 30 * 1000; // Check every 30 seconds

export function useSessionExpiry(): UseSessionExpiryResult {
  const { expiresAt, refreshTokens, logout, isAuthenticated } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [warningDismissed, setWarningDismissed] = useState(false);

  const checkExpiry = useCallback(() => {
    if (!isAuthenticated || !expiresAt) {
      setShowWarning(false);
      setTimeRemaining(0);
      return;
    }

    const now = Date.now();
    const remaining = expiresAt - now;
    setTimeRemaining(Math.max(0, remaining));

    if (remaining <= 0) {
      // Session expired
      logout();
      setShowWarning(false);
    } else if (remaining <= WARNING_THRESHOLD && !warningDismissed) {
      setShowWarning(true);
    } else if (remaining > WARNING_THRESHOLD) {
      setShowWarning(false);
      setWarningDismissed(false);
    }
  }, [expiresAt, isAuthenticated, logout, warningDismissed]);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowWarning(false);
      setTimeRemaining(0);
      return;
    }

    checkExpiry();
    const interval = setInterval(checkExpiry, CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [checkExpiry, isAuthenticated]);

  const extendSession = useCallback(async () => {
    const success = await refreshTokens();
    console.log("=====SUCCESS====", success);
    if (success) {
      setShowWarning(false);
      setWarningDismissed(false);
    } else {
      logout();
    }
  }, [refreshTokens, logout]);

  const dismissWarning = useCallback(() => {
    setWarningDismissed(true);
    setShowWarning(false);
  }, []);

  const minutes = Math.floor(timeRemaining / (60 * 1000));
  const seconds = Math.floor((timeRemaining % (60 * 1000)) / 1000);
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return {
    showWarning,
    timeRemaining,
    formattedTime,
    extendSession,
    dismissWarning,
  };
}
