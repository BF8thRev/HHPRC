export type Countdown = { days: number; hours: number; minutes: number; seconds: number };

/** Time left until `target`, never negative. */
export function countdown(now: number, target: number): Countdown {
  const total = Math.max(0, Math.floor((target - now) / 1000));
  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor((total % 86_400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}
