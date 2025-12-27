<template>
  <Alert :show="alert.show" :message="alert.message" :type="alert.type" @close="alert.show = false" />
  
  <Dialog
    :show="dialog.show"
    :title="dialog.title"
    :message="dialog.message"
    :type="dialog.type"
    :confirm-text="dialog.confirmText"
    :cancel-text="dialog.cancelText"
    @confirm="dialog.onConfirm"
    @cancel="dialog.show = false"
    @close="dialog.show = false"
  />

    <div class="container">
      <h1 class="page-title">{{ t('users.title') }}</h1>
      <p class="page-subtitle">{{ t('users.subtitle') }}</p>

      <div class="action-bar">
        <button @click="toggleView" class="btn-toggle"
          :class="{ 'btn-primary': !showCreateForm, 'btn-secondary': showCreateForm }">
          {{ showCreateForm ? t('users.viewUsers') : t('users.createNewUser') }}
        </button>
      </div>

      <div class="card" v-if="!showCreateForm">
        <div v-if="loading" class="loading-container">
          <div class="loading"></div>
          <span>{{ t('users.loadingUsers') }}</span>
        </div>

        <div v-else-if="error" class="error">
          {{ error }}
        </div>

        <div v-else-if="users.length === 0" class="empty-state">
          {{ t('users.noUsers') }}
        </div>

        <table v-else>
          <thead>
            <tr>
              <th>{{ t('users.id') }}</th>
              <th>{{ t('users.name') }}</th>
              <th>{{ t('users.email') }}</th>
              <th>{{ t('users.role') }}</th>
              <th>{{ t('users.createdAt') }}</th>
              <th>{{ t('users.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span :class="['badge', `badge-${user.role}`]">
                  {{ user.role }}
                </span>
              </td>
              <td>{{ formatDate(user.created_at) }}</td>
              <td>
                <button @click="handleDeleteUser(user.id)" class="btn-delete" :disabled="deleting === user.id"
                  :title="t('users.deleteUser')">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card" v-else>
        <h2 class="form-title">{{ t('users.formTitle') }}</h2>

      <Form ref="formRef" :validation-schema="fieldSchema" @submit="handleCreateUser" class="login-form">
          <div class="form-group">
            <label for="name">{{ t('users.name') }}</label>
            <Field id="name" name="name" type="text" class="input" :placeholder="t('users.namePlaceholder')" />
            <ErrorMessage name="name" class="error-message" />
          </div>

          <div class="form-group">
            <label for="email">{{ t('users.email') }}</label>
            <Field id="email" name="email" type="email" class="input" :placeholder="t('users.emailPlaceholder')" />
            <ErrorMessage name="email" class="error-message" />
          </div>

          <div class="form-group">
            <label for="password">{{ t('login.password') }}</label>
            <Field id="password" name="password" type="password" class="input" :placeholder="t('users.passwordPlaceholder')" />
            <ErrorMessage name="password" class="error-message" />
          </div>

          <div class="form-group">
            <label for="role">{{ t('users.role') }}</label>
            <Field as="select" id="role" name="role" class="input" required>
              <option value="">{{ t('users.selectRole') }}</option>
              <option :value="UserRole.ADMIN">{{ t('users.admin') }}</option>
              <option :value="UserRole.USER">{{ t('users.user') }}</option>
            </Field>
            <ErrorMessage name="role" class="error-message" />
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-submit" :disabled="creating">
              {{ creating ? t('users.creating') : t('users.createUser') }}
            </button>
            <button type="button" class="btn-cancel" @click="resetForm">
              {{ t('users.reset') }}
            </button>
          </div>
      </Form>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { usersApi } from '@/api/users';
import { User, UserRole, CreateUserRequest } from '@/types';
import Alert from '@/components/Alert.vue';
import Dialog from '@/components/Dialog.vue';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { ErrorMessage, Field, Form } from 'vee-validate';
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();

const fieldSchema = toTypedSchema(
  z.object({
    email: z
      .string({ message: t('users.emailRequired') })
      .min(1, t('users.emailRequired'))
      .email(t('users.invalidEmail')),
    password: z
      .string({ message: t('users.passwordRequired') })
      .min(1, t('users.passwordRequired'))
      .min(6, t('users.passwordMinLength')),  
    name: z
      .string({ message: t('users.nameRequired') })
      .min(1, t('users.nameRequired')),
    role: z
      .enum([UserRole.ADMIN, UserRole.USER], { message: t('users.roleRequired') })
  })
);

const users = ref<User[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const formRef = ref<any>(null);

const showCreateForm = ref(false);
const creating = ref(false);
const deleting = ref<number | null>(null);

const alert = reactive({
  show: false,
  message: '',
  type: 'info' as 'success' | 'error' | 'warning' | 'info'
});

const dialog = reactive({
  show: false,
  title: '',
  message: '',
  type: 'info' as 'danger' | 'warning' | 'info' | 'success',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  onConfirm: () => {}
});

const showAlert = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
  alert.message = message;
  alert.type = type;
  alert.show = true;
};

const showDialog = (
  title: string,
  message: string,
  onConfirm: () => void,
  type: 'danger' | 'warning' | 'info' | 'success' = 'info',
  confirmText = 'Confirm',
  cancelText = 'Cancel'
) => {
  dialog.title = title;
  dialog.message = message;
  dialog.type = type;
  dialog.confirmText = confirmText;
  dialog.cancelText = cancelText;
  dialog.onConfirm = onConfirm;
  dialog.show = true;
};

const fetchUsers = async () => {
  loading.value = true;
  error.value = null;

  try {
    users.value = await usersApi.listUsers();
  } catch (err: any) {
    const errorMsg = err.response?.data?.error || 'Failed to fetch users';
    error.value = errorMsg;
    showAlert(errorMsg, 'error');
  } finally {
    loading.value = false;
  }
};

const toggleView = () => {
  showCreateForm.value = !showCreateForm.value;
  alert.show = false;
};

const resetForm = () => {
  formRef.value?.resetForm();
};

const handleCreateUser = async (values: any) => {
  creating.value = true;

  try {
    const userData: CreateUserRequest = {
      name: values.name,
      email: values.email,
      password: values.password,
      role: values.role as UserRole
    };

    await usersApi.createUser(userData);
    showAlert(t('users.userCreated'), 'success');
    formRef.value?.resetForm();
    await fetchUsers();

    setTimeout(() => {
      showCreateForm.value = false;
    }, 2000);
  } catch (err: any) {
    const errorMsg = err.response?.data?.error || 'Failed to create user';
    showAlert(errorMsg, 'error');
  } finally {
    creating.value = false;
  }
};

const handleDeleteUser = (userId: number) => {
  showDialog(
    t('users.deleteConfirmTitle'),
    t('users.deleteConfirmMessage'),
    async () => {
      deleting.value = userId;

      try {
        await usersApi.deleteUser(userId);
        showAlert(t('users.userDeleted'), 'success');
        await fetchUsers();
      } catch (err: any) {
        const errorMsg = err.response?.data?.error || 'Failed to delete user';
        showAlert(errorMsg, 'error');
      } finally {
        deleting.value = null;
      }
    },
    'danger',
    t('users.delete'),
    t('users.cancel')
  );
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString(locale.value === 'pt' ? 'pt-BR' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.action-bar {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: flex-end;
}

.btn-toggle {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--primary-color, #3b82f6);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-hover, #2563eb);
}

.btn-secondary {
  background: var(--secondary-color, #6b7280);
  color: white;
}

.btn-secondary:hover {
  background: var(--secondary-hover, #4b5563);
}

.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 0.375rem;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-color, #3b82f6);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-submit,
.btn-cancel {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-submit {
  background: var(--primary-color, #3b82f6);
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: var(--primary-hover, #2563eb);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancel {
  background: var(--secondary-light, #f3f4f6);
  color: var(--text-primary);
}

.btn-cancel:hover {
  background: var(--secondary-color, #e5e7eb);
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}

table {
  margin-top: 1rem;
}

.btn-delete {
  padding: 0.5rem;
  background: transparent;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 0.25rem;
  color: var(--danger-color, #dc2626);
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-delete:hover:not(:disabled) {
  background: var(--danger-light, #fee2e2);
  border-color: var(--danger-color, #dc2626);
}

.btn-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  table {
    font-size: 0.875rem;
  }

  th,
  td {
    padding: 0.5rem;
  }
}

.error-message {
  color: red;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
</style>
