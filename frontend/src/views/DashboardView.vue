<template>
  <div class="container">
    <h1 class="page-title">Dashboard</h1>
    
    <div class="dashboard-grid">
      <div class="card">
        <h2 class="card-title">Welcome to your dashboard, {{ authStore.user?.name }}!</h2>
        <p class="card-text">
          You are logged in as <span :class="['badge', `badge-${authStore.user?.role}`]">{{ authStore.user?.role }}</span>
        </p>
        <div class="user-details">
          <p><strong>Email:</strong> {{ authStore.user?.email }}</p>
          <p><strong>Created At:</strong> {{ formatDate(authStore.user?.created_at) }}</p>
        </div>
      </div>

      <div class="card">
        <h2 class="card-title">Quick Access</h2>
        <div class="actions">
          <router-link to="/github" class="btn btn-primary">
            Search GitHub
          </router-link>
          <router-link v-if="authStore.isAdmin" to="/users" class="btn btn-secondary">
            View All Users
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const formatDate = (date?: string) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
</script>

<style scoped>
.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.card-text {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.user-details {
  margin-top: 1rem;
}

.user-details p {
  margin: 0.5rem 0;
  font-size: 0.875rem;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.features-list {
  list-style: none;
  padding: 0;
}

.features-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
}

.features-list li:last-child {
  border-bottom: none;
}
</style>
