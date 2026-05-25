<script setup lang="ts">
import { useToastStore } from '../store/toast';

const toastStore = useToastStore();
</script>

<template>
  <div class="toast-container">
    <TransitionGroup name="toast-list">
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        class="toast-item glass-card"
        :class="'toast-' + toast.type"
      >
        <!-- Icon matching the notification type -->
        <div class="toast-icon">
          <svg v-if="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon icon-success">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else-if="toast.type === 'error'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon icon-danger">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else-if="toast.type === 'warning'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon icon-warning">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon icon-info">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <!-- Notification Message -->
        <div class="toast-content">
          <p class="toast-message">{{ toast.message }}</p>
        </div>

        <!-- Manual Dismiss Button -->
        <button @click="toastStore.removeToast(toast.id)" class="toast-close-btn" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="close-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Progress Indicator Line at the Bottom -->
        <div
          v-if="toast.duration && toast.duration > 0"
          class="toast-progress"
          :style="{ animationDuration: toast.duration + 'ms' }"
        ></div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 380px;
  pointer-events: none;
}

.toast-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 40px 16px 16px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.85); /* Slightly darker for contrast */
  border-left: 4px solid transparent;
  pointer-events: auto;
  overflow: hidden;
  box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.5);
}

.toast-item.glass-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px -5px rgba(0, 0, 0, 0.6);
}

/* Color Coding based on system status */
.toast-success {
  border-left-color: hsl(var(--color-success));
  color: hsl(var(--color-success));
}
.toast-success .toast-message {
  color: hsl(var(--text-primary));
}

.toast-error {
  border-left-color: hsl(var(--color-danger));
  color: hsl(var(--color-danger));
}
.toast-error .toast-message {
  color: hsl(var(--text-primary));
}

.toast-warning {
  border-left-color: hsl(var(--color-warning));
  color: hsl(var(--color-warning));
}
.toast-warning .toast-message {
  color: hsl(var(--text-primary));
}

.toast-info {
  border-left-color: hsl(var(--color-primary));
  color: hsl(var(--color-primary));
}
.toast-info .toast-message {
  color: hsl(var(--text-primary));
}

.toast-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  width: 24px;
  height: 24px;
}

.toast-content {
  flex-grow: 1;
}

.toast-message {
  font-size: 0.925rem;
  font-weight: 500;
  margin: 0;
  line-height: 1.4;
}

.toast-close-btn {
  position: absolute;
  top: 14px;
  right: 12px;
  background: transparent;
  border: none;
  color: hsl(var(--text-muted));
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.toast-close-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: hsl(var(--text-primary));
}

.close-icon {
  width: 14px;
  height: 14px;
}

/* Animated Progress bar at the bottom */
.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  background: currentColor;
  opacity: 0.35;
  animation: shrink linear forwards;
}

@keyframes shrink {
  from { width: 100%; }
  to { width: 0%; }
}

/* Vue TransitionGroup styling */
.toast-list-enter-active,
.toast-list-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-list-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.toast-list-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

/* Ensure animating items are positioned properly */
.toast-list-move {
  transition: transform 0.3s ease;
}
</style>
