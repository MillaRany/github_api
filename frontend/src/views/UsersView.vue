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
      <h1 class="page-title">Users Management</h1>
      <p class="page-subtitle">Admin only - View all registered users</p>

      <div class="action-bar">
        <button @click="toggleView" class="btn-toggle"
          :class="{ 'btn-primary': !showCreateForm, 'btn-secondary': showCreateForm }">
          {{ showCreateForm ? 'View Users' : 'Create New User' }}
        </button>
      </div>

      <div class="card" v-if="!showCreateForm">
        <div v-if="loading" class="loading-container">
          <div class="loading"></div>
          <span>Loading users...</span>
        </div>

        <div v-else-if="error" class="error">
          {{ error }}
        </div>

        <div v-else-if="users.length === 0" class="empty-state">
          No users found.
        </div>

        <table v-else>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created At</th>
              <th>Actions</th>
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
                  title="Delete user">
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
        <h2 class="form-title">Create New User</h2>

        <form @submit.prevent="handleCreateUser">
          <div class="form-group">
            <label for="name">Name</label>
            <input v-model="newUser.name" type="text" id="name" required placeholder="Enter full name" />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input v-model="newUser.email" type="email" id="email" required placeholder="Enter email address" />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input v-model="newUser.password" type="password" id="password" required minlength="6"
              placeholder="Enter password (min 6 characters)" />
          </div>

          <div class="form-group">
            <label for="role">Role</label>
            <select v-model="newUser.role" id="role" required>
              <option value="">Select a role</option>
              <option :value="UserRole.ADMIN">Admin</option>
              <option :value="UserRole.USER">User</option>
            </select>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-submit" :disabled="creating">
              {{ creating ? 'Creating...' : 'Create User' }}
            </button>
            <button type="button" class="btn-cancel" @click="resetForm">
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { usersApi } from '@/api/users';
import { User, UserRole, CreateUserRequest } from '@/types';
import Alert from '@/components/Alert.vue';
import Dialog from '@/components/Dialog.vue';

const users = ref<User[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

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
const newUser = ref<{
  name: string;
  email: string;
  password: string;
  role: UserRole | '';
}>({
  name: '',
  email: '',
  password: '',
  role: ''
});

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
  newUser.value = {
    name: '',
    email: '',
    password: '',
    role: ''
  };
};

const handleCreateUser = async () => {
  creating.value = true;

  try {
    const userData: CreateUserRequest = {
      name: newUser.value.name,
      email: newUser.value.email,
      password: newUser.value.password,
      role: newUser.value.role as UserRole
    };

    await usersApi.createUser(userData);
    showAlert('User created successfully!', 'success');
    resetForm();
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
    'Delete User',
    'Are you sure you want to delete this user? This action cannot be undone.',
    async () => {
      deleting.value = userId;

      try {
        await usersApi.deleteUser(userId);
        showAlert('User deleted successfully!', 'success');
        await fetchUsers();
      } catch (err: any) {
        const errorMsg = err.response?.data?.error || 'Failed to delete user';
        showAlert(errorMsg, 'error');
      } finally {
        deleting.value = null;
      }
    },
    'danger',
    'Delete',
    'Cancel'
  );
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
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
</style>
