import { useState, useEffect, useCallback } from "react";

interface UseCountdownProps {
  initialSeconds: number;
  onExpired?: () => void;
  autoStart?: boolean;
}

interface CountdownResult {
  seconds: number;
  minutes: number;
  timeRemaining: number;
  isExpired: boolean;
  formattedTime: string;
  start: () => void;
  stop: () => void;
  reset: (newSeconds?: number) => void;
}

export function useCountdown({
  initialSeconds,
  onExpired,
  autoStart = true,
}: UseCountdownProps): CountdownResult {
  const [timeRemaining, setTimeRemaining] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(autoStart);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    if (isActive && timeRemaining > 0) {
      intervalId = setInterval(() => {
        setTimeRemaining((time) => {
          if (time <= 1) {
            setIsActive(false);
            onExpired?.();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isActive, timeRemaining, onExpired]);

  const start = useCallback(() => {
    if (timeRemaining > 0) {
      setIsActive(true);
    }
  }, [timeRemaining]);

  const stop = useCallback(() => {
    setIsActive(false);
  }, []);

  const reset = useCallback(
    (newSeconds?: number) => {
      const resetTime = newSeconds ?? initialSeconds;
      setTimeRemaining(resetTime);
      setIsActive(autoStart && resetTime > 0);
    },
    [initialSeconds, autoStart]
  );

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return {
    seconds,
    minutes,
    timeRemaining,
    isExpired: timeRemaining === 0,
    formattedTime,
    start,
    stop,
    reset,
  };
}
