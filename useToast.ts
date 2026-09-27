import { useState, useEffect } from 'react';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

type ToastListener = (toasts: ToastItem[]) => void;
let globalToasts: ToastItem[] = [];
const listeners: Set<ToastListener> = new Set();

function notifyListeners() {
  const current = [...globalToasts];
  listeners.forEach((listener) => listener(current));
}

export function showToast(
  toastOrTitle: Omit<ToastItem, 'id'> | string,
  typeArg?: 'success' | 'error' | 'info' | 'warning'
) {
  const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  let item: ToastItem;

  if (typeof toastOrTitle === 'string') {
    item = {
      id,
      title: toastOrTitle,
      type: typeArg || 'info',
      duration: 4000,
    };
  } else {
    item = { ...toastOrTitle, id };
  }

  globalToasts = [item, ...globalToasts.slice(0, 4)];
  notifyListeners();

  const duration = item.duration ?? 4000;
  if (duration > 0) {
    setTimeout(() => {
      dismissToast(id);
    }, duration);
  }
  return id;
}

export function dismissToast(id: string) {
  globalToasts = globalToasts.filter((t) => t.id !== id);
  notifyListeners();
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>(globalToasts);

  useEffect(() => {
    const listener: ToastListener = (updated) => setToasts(updated);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    toasts,
    toast: showToast,
    dismiss: dismissToast,
    success: (title: string, message?: string) => showToast({ type: 'success', title, message }),
    error: (title: string, message?: string) => showToast({ type: 'error', title, message }),
    info: (title: string, message?: string) => showToast({ type: 'info', title, message }),
    warning: (title: string, message?: string) => showToast({ type: 'warning', title, message }),
  };
}
