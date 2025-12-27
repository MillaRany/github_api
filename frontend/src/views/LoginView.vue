<template>
  <div class="login-container">
    <div class="login-card card">
      <h1 class="login-title">{{ t('login.title') }}</h1>
      <p class="login-subtitle">{{ t('login.subtitle') }}</p>

      <Form :validation-schema="fieldSchema" @submit="handleLogin" class="login-form">
        <div class="form-group">
          <label class="label" for="email">{{ t('login.email') }}</label>
          <Field id="email" name="email" type="email" class="input" :placeholder="t('login.emailPlaceholder')" />
          <ErrorMessage name="email" class="error-message" />
        </div>

        <div class="form-group">
          <label class="label" for="password">{{ t('login.password') }}</label>
          <Field id="password" name="password" type="password" class="input" :placeholder="t('login.passwordPlaceholder')" />
          <ErrorMessage name="password" class="error-message" />
        </div>

        <div v-if="authStore.error" class="error">
          {{ authStore.error }}
        </div>

        <button type="submit" class="btn btn-primary btn-full" :disabled="authStore.loading">
          <span v-if="authStore.loading" class="loading"></span>
          <span v-else>{{ t('login.loginButton') }}</span>
        </button>
      </Form>

      <div class="login-info">
        <p><strong>{{ t('login.demoCredentials') }}</strong></p>
        <p>{{ t('login.admin') }}</p>
        <p>{{ t('login.user') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { LoginRequest } from '@/types';
import { ErrorMessage, Field, Form } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const fieldSchema = toTypedSchema(
  z.object({
    email: z
      .string({ message: t('login.emailRequired') })
      .min(1, t('login.emailRequired'))
      .email(t('login.invalidEmail')),
    password: z
      .string({ message: t('login.passwordRequired') })
      .min(1, t('login.passwordRequired'))
      .min(6, t('login.passwordMinLength')),  
  })
);

const router = useRouter();
const authStore = useAuthStore();

const handleLogin = async (values: any) => {
  const success = await authStore.login(values as LoginRequest);
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

.error-message {
  color: red;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
</style>
