import { create } from "zustand";

export interface ToastAction {
  label: string;
  onAction: () => void;
}

export interface Toast {
  id: number;
  message: string;
  action?: ToastAction;
}

interface ToastState {
  toast: Toast | null;
  show: (message: string, action?: ToastAction) => void;
  dismiss: () => void;
}

let counter = 0;

export const useToastStore = create<ToastState>()((set) => ({
  toast: null,
  show: (message, action) =>
    set({ toast: { id: ++counter, message, action } }),
  dismiss: () => set({ toast: null }),
}));
