import { useEffect, useRef } from 'react';
import { useTimeStore } from '../store/useTimeStore';

export function useOrbitAnimation() {
  const { isPlaying, speedMultiplier, advanceDays } = useTimeStore();
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    const tick = (now: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = now;
      const deltaMs = now - lastTimeRef.current;
      lastTimeRef.current = now;

      // 1 segundo real = speedMultiplier días simulados
      const daysElapsed = (deltaMs / 1000) * speedMultiplier;
      advanceDays(daysElapsed);

      rafRef.current = requestAnimationFrame(tick);
    };

    lastTimeRef.current = 0;
    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, speedMultiplier, advanceDays]);
}
