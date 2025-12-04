import { useEffect, useState, useRef } from 'react';

/**
 * Custom hook to manage guest user video watching time limit
 * Shows a modal when guest user has watched for 10 seconds
 *
 * @param {boolean} isGuest - Whether the current user is a guest (no token)
 * @param {boolean} isPlaying - Whether the video is currently playing
 * @param {function} onTimeLimitReached - Callback when 10 seconds is reached
 * @returns {object} { timeLeft, hasReachedLimit }
 */
export function useGuestVideoTimer(isGuest, isPlaying, onTimeLimitReached) {
  const GUEST_WATCH_LIMIT = 60; // 60 seconds
  const [timeLeft, setTimeLeft] = useState(GUEST_WATCH_LIMIT);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    // Only start timer if user is guest, video is playing, and limit not reached
    if (!isGuest || !isPlaying || hasReachedLimit) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime - 1;

        // Check if limit reached
        if (newTime <= 0) {
          clearInterval(timerIntervalRef.current);
          setHasReachedLimit(true);
          if (onTimeLimitReached) {
            onTimeLimitReached();
          }
          return 0;
        }

        return newTime;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isGuest, isPlaying, hasReachedLimit, onTimeLimitReached]);

  // Reset timer when video is paused
  useEffect(() => {
    if (!isPlaying && timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  }, [isPlaying]);

  const resetTimer = () => {
    setTimeLeft(GUEST_WATCH_LIMIT);
    setHasReachedLimit(false);
  };

  return {
    timeLeft,
    hasReachedLimit,
    resetTimer,
  };
}
