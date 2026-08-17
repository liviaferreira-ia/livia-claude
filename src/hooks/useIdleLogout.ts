"use client";

import { useEffect, useRef } from "react";
import {
  clearSessionActivity,
  IDLE_TIMEOUT_MS,
  markSessionActivity,
  readSessionActivity,
  sessionActivityKey,
} from "@/lib/sessionActivity";

const ACTIVITY_WRITE_INTERVAL_MS = 10 * 1000;

type UseIdleLogoutOptions = {
  enabled: boolean;
  userId?: string;
  onIdle: () => Promise<void> | void;
};

/**
 * Encerra a sessao depois de 15 minutos sem interacao. O horario fica no
 * localStorage para que todas as abas compartilhem a mesma atividade e para
 * detectar a expiracao assim que o usuario volta ao navegador.
 */
export function useIdleLogout({ enabled, userId, onIdle }: UseIdleLogoutOptions) {
  const expiringRef = useRef(false);
  const lastWriteRef = useRef(0);
  const onIdleRef = useRef(onIdle);

  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  useEffect(() => {
    if (!enabled || !userId) return;

    expiringRef.current = false;
    const storageKey = sessionActivityKey(userId);
    let memoryLastActivity: number | null = readSessionActivity(userId);

    const readLastActivity = () => readSessionActivity(userId) ?? memoryLastActivity;

    const writeActivity = (at: number) => {
      memoryLastActivity = at;
      markSessionActivity(userId, at);
    };

    const expire = () => {
      if (expiringRef.current) return;
      expiringRef.current = true;
      memoryLastActivity = null;
      clearSessionActivity(userId);
      void onIdleRef.current();
    };

    const checkExpired = () => {
      const lastActivity = readLastActivity();
      if (lastActivity !== null && Date.now() - lastActivity >= IDLE_TIMEOUT_MS) {
        expire();
        return true;
      }
      return false;
    };

    const recordActivity = () => {
      if (expiringRef.current || checkExpired()) return;
      const now = Date.now();
      if (now - lastWriteRef.current < ACTIVITY_WRITE_INTERVAL_MS) return;
      lastWriteRef.current = now;
      writeActivity(now);
    };

    const checkWhenVisible = () => {
      if (document.visibilityState === "visible") checkExpired();
    };

    const syncAcrossTabs = (event: StorageEvent) => {
      if (event.key === storageKey && event.newValue === null) expire();
    };

    const previousActivity = readLastActivity();
    if (previousActivity === null) {
      recordActivity();
    } else if (checkExpired()) {
      return;
    }

    const activityEvents: (keyof WindowEventMap)[] = ["pointerdown", "keydown", "touchstart", "scroll"];
    activityEvents.forEach((eventName) =>
      window.addEventListener(eventName, recordActivity, { passive: true }),
    );
    window.addEventListener("focus", checkExpired);
    window.addEventListener("storage", syncAcrossTabs);
    document.addEventListener("visibilitychange", checkWhenVisible);
    const interval = window.setInterval(checkExpired, 15_000);

    return () => {
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, recordActivity));
      window.removeEventListener("focus", checkExpired);
      window.removeEventListener("storage", syncAcrossTabs);
      document.removeEventListener("visibilitychange", checkWhenVisible);
      window.clearInterval(interval);
    };
  }, [enabled, userId]);
}
