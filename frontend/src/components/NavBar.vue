<template>
  <nav class="navbar">
    <div class="container">
      <div class="nav-content">
        <div class="nav-brand">
          <router-link to="/dashboard">GitHub API</router-link>
        </div>
        
        <div class="nav-links">
          <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
          <router-link v-if="authStore.isAdmin" to="/users" class="nav-link">Users</router-link>
          <router-link to="/github" class="nav-link">GitHub</router-link>
        </div>

        <div class="nav-user">
          <span class="user-name">{{ authStore.user?.name }}</span>
          <span :class="['badge', `badge-${authStore.user?.role}`]">
            {{ authStore.user?.role }}
          </span>
          <button @click="handleLogout" class="btn btn-secondary btn-sm">
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.navbar {
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow);
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
}

.nav-brand a {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-color);
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--primary-color);
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-name {
  font-weight: 500;
  color: var(--text-primary);
}

.btn-sm {
  padding: 0.375rem 0.875rem;
  font-size: 0.8125rem;
}
</style>
