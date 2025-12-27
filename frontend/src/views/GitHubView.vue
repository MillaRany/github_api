<template>
  <div class="container">
    <h1 class="page-title">{{ t('github.title') }}</h1>
    <p class="page-subtitle">{{ t('github.subtitle') }}</p>

    <div class="search-card card">
      <Form @submit="handleSearch" class="search-form" :validation-schema="fieldSchema">
        <div class="search-input-wrapper">
          <Field id="username" name="username" type="text" class="input" :placeholder="t('github.usernamePlaceholder')" />
          <ErrorMessage name="username" class="error-message" />
        </div>
        <button type="submit" class="btn btn-primary" :disabled="searchLoading">
          <span v-if="searchLoading" class="loading"></span>
          <span v-else>{{ t('github.search') }}</span>
        </button>
      </Form>
    </div>

    <div v-if="profileError" class="error card">
      {{ profileError }}
    </div>

    <div v-if="profile" class="profile-section">
      <div class="card profile-card">
        <div class="profile-header">
          <img :src="profile.avatar_url" :alt="profile.name" class="profile-avatar" />
          <div class="profile-info">
            <h2 class="profile-name">{{ profile.name || profile.login }}</h2>
            <p class="profile-username">@{{ profile.login }}</p>
            <p v-if="profile.bio" class="profile-bio">{{ profile.bio }}</p>

            <div class="profile-meta">
              <span v-if="profile.company">🏢 {{ profile.company }}</span>
              <span v-if="profile.location">📍 {{ profile.location }}</span>
              <span v-if="profile.blog">🔗 <a :href="profile.blog" target="_blank">{{ profile.blog }}</a></span>
            </div>

            <div class="profile-stats">
              <div class="stat">
                <strong>{{ profile.public_repos }}</strong>
                <span>{{ t('github.repositories') }}</span>
              </div>
              <div class="stat">
                <strong>{{ profile.followers }}</strong>
                <span>{{ t('github.followers') }}</span>
              </div>
              <div class="stat">
                <strong>{{ profile.following }}</strong>
                <span>{{ t('github.following') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card repos-card">
        <h3 class="repos-title">{{ t('github.repositories') }}</h3>

        <div v-if="reposLoading" class="loading-container">
          <div class="loading"></div>
          <span>{{ t('github.loadingRepos') }}</span>
        </div>

        <div v-else-if="reposError" class="error">
          {{ reposError }}
        </div>

        <div v-else-if="repositories.length === 0" class="empty-state">
          {{ t('github.noRepos') }}
        </div>

        <div v-else class="repos-grid">
          <div v-for="repo in repositories" :key="repo.id" class="repo-card">
            <h4 class="repo-name">
              <a :href="repo.html_url" target="_blank">{{ repo.name }}</a>
            </h4>
            <p v-if="repo.description" class="repo-description">
              {{ repo.description }}
            </p>
            <div class="repo-meta">
              <span v-if="repo.language" class="repo-language">{{ repo.language }}</span>
              <span class="repo-stat">⭐ {{ repo.stargazers_count }}</span>
              <span class="repo-stat">🍴 {{ repo.forks_count }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { githubApi } from '@/api/github';
import { GitHubProfile, GitHubRepository } from '@/types';
import { Field, Form, ErrorMessage } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const fieldSchema = toTypedSchema(
  z.object({
    username: z
      .string({ message: t('github.usernameRequired') })
      .min(1, t('github.usernameRequired')),
  })
);

const route = useRoute();

const searchUsername = ref('');
const profile = ref<GitHubProfile | null>(null);
const repositories = ref<GitHubRepository[]>([]);

const searchLoading = ref(false);
const reposLoading = ref(false);
const profileError = ref<string | null>(null);
const reposError = ref<string | null>(null);

const handleSearch = async (values: any) => {
  searchUsername.value = values.username;

  searchLoading.value = true;
  profileError.value = null;
  profile.value = null;
  repositories.value = [];

  try {
    profile.value = await githubApi.getProfile(searchUsername.value);
    await fetchRepositories();
  } catch (err: any) {
    profileError.value = err.response?.data?.error || 'Failed to fetch GitHub profile';
  } finally {
    searchLoading.value = false;
  }
};

const fetchRepositories = async () => {
  if (!searchUsername.value) return;

  reposLoading.value = true;
  reposError.value = null;

  try {
    repositories.value = await githubApi.getRepositories(searchUsername.value);
  } catch (err: any) {
    reposError.value = err.response?.data?.error || 'Failed to fetch repositories';
  } finally {
    reposLoading.value = false;
  }
};

onMounted(() => {
  const username = route.params.username as string;
  if (username) {
    searchUsername.value = username;
    handleSearch({ username });
  } else {
    profile.value = null;
    repositories.value = [];
    profileError.value = null;
    reposError.value = null;
  }
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
  margin-bottom: 2rem;
}

.search-card {
  margin-bottom: 2rem;
}

.search-form {
  display: flex;
  gap: 1rem;
}

.search-input-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.search-form .input {
  width: 100%;
}

.error-message {
  color: red;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.profile-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-header {
  display: flex;
  gap: 2rem;
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.profile-username {
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
}

.profile-bio {
  margin-bottom: 1rem;
}

.profile-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.profile-meta a {
  color: var(--primary-color);
  text-decoration: none;
}

.profile-stats {
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat strong {
  font-size: 1.5rem;
  color: var(--primary-color);
}

.stat span {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.repos-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.repos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.repo-card {
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  transition: box-shadow 0.2s;
}

.repo-card:hover {
  box-shadow: var(--shadow-md);
}

.repo-name {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.repo-name a {
  color: var(--primary-color);
  text-decoration: none;
}

.repo-name a:hover {
  text-decoration: underline;
}

.repo-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
}

.repo-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.repo-language {
  font-weight: 500;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .profile-stats {
    justify-content: center;
  }

  .search-form {
    flex-direction: column;
  }
}
</style>
