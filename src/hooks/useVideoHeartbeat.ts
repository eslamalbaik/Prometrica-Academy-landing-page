import { useEffect, useRef } from 'react';
import { api } from '@/lib/api';

/**
 * Anti-cheat video heartbeat (React).
 *
 * NOTE: students watch lessons in this React app, so the heartbeat lives here
 * (a Vue composable would never run for a learner). While `isPlaying` is true,
 * it POSTs /v1/progress/ping every PING_INTERVAL seconds with the live
 * current_time + duration. The server accumulates watched time by a fixed step
 * and decides completion — the client cannot fake it by seeking.
 *
 * @param lessonId        active lesson id (null disables the heartbeat)
 * @param isPlaying       whether the video is currently playing
 * @param getCurrentTime  returns the live playhead position in seconds
 * @param getDuration     returns the total video duration in seconds
 * @param onCompleted     called once when the server reports completion
 */
export function useVideoHeartbeat(opts: {
  lessonId: number | null;
  isPlaying: boolean;
  getCurrentTime: () => number;
  getDuration: () => number;
  onCompleted?: () => void;
}) {
  const { lessonId, isPlaying, getCurrentTime, getDuration, onCompleted } = opts;

  const PING_INTERVAL = 15; // seconds — matches the server STEP tolerance
  const completedRef = useRef(false);
  // Keep the latest callbacks/getters without re-arming the interval each render.
  const refs = useRef({ getCurrentTime, getDuration, onCompleted });
  refs.current = { getCurrentTime, getDuration, onCompleted };

  // Reset the "already completed" guard whenever the lesson changes.
  useEffect(() => {
    completedRef.current = false;
  }, [lessonId]);

  useEffect(() => {
    if (!lessonId || !isPlaying) return;

    const sendPing = async () => {
      try {
        const res = await api.post('/v1/progress/ping', {
          lesson_id: lessonId,
          current_time: Math.floor(refs.current.getCurrentTime() || 0),
          duration: Math.floor(refs.current.getDuration() || 0),
        });
        if (res.data?.is_completed && !completedRef.current) {
          completedRef.current = true;
          refs.current.onCompleted?.();
        }
      } catch {
        // Network hiccup — silently skip this beat; the next one will retry.
      }
    };

    const id = window.setInterval(sendPing, PING_INTERVAL * 1000);
    return () => window.clearInterval(id);
  }, [lessonId, isPlaying]);
}
