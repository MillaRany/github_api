<template>
  <div class="container">
    <div class="not-found">
      <h1 class="not-found-title">404</h1>
      <p class="not-found-text">Page not found</p>
      <router-link to="/dashboard" class="btn btn-primary">
        Go to Dashboard
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
}

.not-found-title {
  font-size: 6rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.not-found-text {
  font-size: 1.5rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
}
</style>
