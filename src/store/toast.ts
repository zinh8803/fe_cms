import { defineStore } from 'pinia';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export const useToastStore = defineStore('toast', {
  state: () => ({
    toasts: [] as Toast[],
  }),
  actions: {
    addToast(message: string, type: Toast['type'] = 'info', duration = 3500) {
      const id = Math.random().toString(36).substring(2, 9);
      this.toasts.push({ id, message, type, duration });
      
      if (duration > 0) {
        setTimeout(() => {
          this.removeToast(id);
        }, duration);
      }
      return id;
    },
    removeToast(id: string) {
      this.toasts = this.toasts.filter((t) => t.id !== id);
    },
    success(message: string, duration?: number) {
      return this.addToast(message, 'success', duration);
    },
    error(message: string, duration?: number) {
      return this.addToast(message, 'error', duration);
    },
    warning(message: string, duration?: number) {
      return this.addToast(message, 'warning', duration);
    },
    info(message: string, duration?: number) {
      return this.addToast(message, 'info', duration);
    }
  },
});
