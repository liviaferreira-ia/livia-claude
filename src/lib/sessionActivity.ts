export const IDLE_TIMEOUT_MS = 15 * 60 * 1000;

function activityKey(userId: string) {
  return `central_last_activity_${userId}`;
}

export function readSessionActivity(userId: string): number | null {
  if (typeof window === "undefined") return null;
  try {
    const value = Number(window.localStorage.getItem(activityKey(userId)));
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

export function markSessionActivity(userId: string, at = Date.now()) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(activityKey(userId), String(at));
  } catch {
    // O temporizador continua funcionando na aba atual mesmo sem persistencia.
  }
}

export function clearSessionActivity(userId: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(activityKey(userId));
  } catch {
    // Storage pode estar indisponivel em navegacao privada.
  }
}

export function sessionActivityKey(userId: string) {
  return activityKey(userId);
}
