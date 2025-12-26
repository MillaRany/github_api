<template>
  <div id="app">
    <NavBar v-if="authStore.isAuthenticated" />
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import NavBar from '@/components/NavBar.vue';

const authStore = useAuthStore();
</script>

<style scoped>
main {
  padding: 2rem 0;
}
</style>
