<template>
  <div class="login-container">
    <div class="login-card card">
      <h1 class="login-title">Login</h1>
      <p class="login-subtitle">GitHub API Integration</p>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label class="label" for="email">Email</label>
          <input id="email" v-model="credentials.email" type="email" class="input" placeholder="Enter your email"
            required />
        </div>

        <div class="form-group">
          <label class="label" for="password">Password</label>
          <input id="password" v-model="credentials.password" type="password" class="input"
            placeholder="Enter your password" required />
        </div>

        <div v-if="authStore.error" class="error">
          {{ authStore.error }}
        </div>

        <button type="submit" class="btn btn-primary btn-full" :disabled="authStore.loading">
          <span v-if="authStore.loading" class="loading"></span>
          <span v-else>Login</span>
        </button>
      </form>

      <div class="login-info">
        <p><strong>Demo credentials:</strong></p>
        <p>Admin: admin@example.com / admin123</p>
        <p>User: user@example.com / user123</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { LoginRequest } from '@/types';

const router = useRouter();
const authStore = useAuthStore();

const credentials = ref<LoginRequest>({
  email: '',
  password: ''
});

const handleLogin = async () => {
  const success = await authStore.login(credentials.value);
  if (success) {
    await router.push('/dashboard');
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 4rem);
}

.login-card {
  width: 100%;
  max-width: 400px;
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 0.5rem;
}

.login-subtitle {
  text-align: center;
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.btn-full {
  width: 100%;
  margin-top: 0.5rem;
}

.login-info {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.login-info p {
  margin: 0.25rem 0;
}
</style>
