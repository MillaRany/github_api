<template>
  <Transition name="slide-fade">
    <div v-if="visible" :class="['alert', `alert-${type}`]" role="alert">
      <div class="alert-icon">
        <svg v-if="type === 'success'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <svg v-else-if="type === 'error'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        <svg v-else-if="type === 'warning'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <svg v-else-if="type === 'info'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      </div>
      
      <div class="alert-content">
        <p class="alert-message">{{ message }}</p>
      </div>
      
      <button @click="close" class="alert-close" aria-label="Close">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

export interface AlertProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  show?: boolean;
}

const props = withDefaults(defineProps<AlertProps>(), {
  type: 'info',
  duration: 5000,
  show: false
});

const emit = defineEmits<{
  close: [];
}>();

const visible = ref(props.show);
let timeoutId: NodeJS.Timeout | null = null;

const close = () => {
  visible.value = false;
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  emit('close');
};

const startTimer = () => {
  if (props.duration > 0) {
    timeoutId = setTimeout(() => {
      close();
    }, props.duration);
  }
};

watch(() => props.show, (newVal) => {
  visible.value = newVal;
  if (newVal) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    startTimer();
  }
});

onMounted(() => {
  if (visible.value) {
    startTimer();
  }
});
</script>

<style scoped>
.alert {
  position: fixed;
  top: 1rem;
  right: 1rem;
  min-width: 300px;
  max-width: 400px;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  z-index: 9999;
  animation: slideIn 0.3s ease-out;
}

.alert-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.alert-content {
  flex: 1;
  min-width: 0;
}

.alert-message {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
  word-wrap: break-word;
}

.alert-close {
  flex-shrink: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}

.alert-close:hover {
  background: rgba(0, 0, 0, 0.1);
}

/* Success */
.alert-success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.alert-success .alert-icon {
  color: #10b981;
}

/* Error */
.alert-error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.alert-error .alert-icon {
  color: #ef4444;
}

/* Warning */
.alert-warning {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
}

.alert-warning .alert-icon {
  color: #f59e0b;
}

/* Info */
.alert-info {
  background: #dbeafe;
  color: #1e40af;
  border: 1px solid #bfdbfe;
}

.alert-info .alert-icon {
  color: #3b82f6;
}

/* Transitions */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

@media (max-width: 768px) {
  .alert {
    left: 1rem;
    right: 1rem;
    min-width: auto;
    max-width: none;
  }
}
</style>
