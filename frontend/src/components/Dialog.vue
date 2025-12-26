<template>
  <Transition name="fade">
    <div v-if="visible" class="dialog-overlay" @click="onOverlayClick">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h3 class="dialog-title">{{ title }}</h3>
          <button v-if="showClose" @click="handleCancel" class="dialog-close" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div class="dialog-body">
          <p class="dialog-message">{{ message }}</p>
        </div>
        
        <div class="dialog-footer">
          <button @click="handleCancel" class="btn-dialog btn-cancel">
            {{ cancelText }}
          </button>
          <button @click="handleConfirm" :class="['btn-dialog', 'btn-confirm', `btn-${type}`]">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

export interface DialogProps {
  title?: string;
  message: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  show?: boolean;
  confirmText?: string;
  cancelText?: string;
  showClose?: boolean;
  closeOnOverlay?: boolean;
}

const props = withDefaults(defineProps<DialogProps>(), {
  title: 'Confirm',
  type: 'info',
  show: false,
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  showClose: true,
  closeOnOverlay: true
});

const emit = defineEmits<{
  confirm: [];
  cancel: [];
  close: [];
}>();

const visible = ref(props.show);

const handleConfirm = () => {
  visible.value = false;
  emit('confirm');
  emit('close');
};

const handleCancel = () => {
  visible.value = false;
  emit('cancel');
  emit('close');
};

const onOverlayClick = () => {
  if (props.closeOnOverlay) {
    handleCancel();
  }
};

watch(() => props.show, (newVal) => {
  visible.value = newVal;
});
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
}

.dialog {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 500px;
  width: 100%;
  animation: slideDown 0.3s ease-out;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.dialog-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary, #111827);
}

.dialog-close {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  color: var(--text-secondary, #6b7280);
  transition: all 0.2s;
}

.dialog-close:hover {
  background: var(--secondary-light, #f3f4f6);
  color: var(--text-primary, #111827);
}

.dialog-body {
  padding: 1.5rem;
}

.dialog-message {
  margin: 0;
  color: var(--text-secondary, #6b7280);
  line-height: 1.5;
}

.dialog-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--border-color, #e5e7eb);
  justify-content: flex-end;
}

.btn-dialog {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.btn-cancel {
  background: var(--secondary-light, #f3f4f6);
  color: var(--text-primary, #374151);
}

.btn-cancel:hover {
  background: var(--secondary-color, #e5e7eb);
}

.btn-confirm {
  color: white;
}

.btn-danger {
  background: #dc2626;
}

.btn-danger:hover {
  background: #b91c1c;
}

.btn-warning {
  background: #f59e0b;
}

.btn-warning:hover {
  background: #d97706;
}

.btn-info {
  background: #3b82f6;
}

.btn-info:hover {
  background: #2563eb;
}

.btn-success {
  background: #10b981;
}

.btn-success:hover {
  background: #059669;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active .dialog {
  animation: slideDown 0.3s ease-out;
}

.fade-leave-active .dialog {
  animation: slideUp 0.2s ease-in;
}

@keyframes slideDown {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-20px);
    opacity: 0;
  }
}

@media (max-width: 640px) {
  .dialog {
    margin: 1rem;
  }
  
  .dialog-footer {
    flex-direction: column-reverse;
  }
  
  .btn-dialog {
    width: 100%;
  }
}
</style>
