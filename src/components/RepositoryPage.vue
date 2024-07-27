<template>
  <div class="container mx-auto mt-6 max-w-7xl font-sans">
    <div class="text-black py-4 px-6 flex justify-between items-center font-bold">
      <div v-if="!hideListName">
        <h1 class="text-lg text-left font-bold">리포지토리 목록</h1>
      </div>
      <div v-if="!hideAddBox" class="flex items-center space-x-4 w-2/3 justify-end">
        <div v-if="adding" v-click-outside="cancelAdding" class="flex items-center space-x-2">
          <input
              id="newRepositoryUrl"
              v-model="newRepositoryUrl"
              class="input-full-width font-thin px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
              name="newRepositoryUrl"
              placeholder="Enter Repository URL"
              type="text"
              @keyup.enter="addRepository"
          />
          <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                  @click="addRepository">
            추가
          </button>
          <button class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm"
                  @click="cancelAdding">
            취소
          </button>
        </div>
        <button v-if="!adding" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                @click="startAdding">
          리포지토리 추가
        </button>
        <button v-if="hasSelectedRepositories"
                class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded text-sm"
                @click="deleteSelectedRepositories">
          리포지토리 삭제
        </button>
      </div>
    </div>

    <div class="repository-header bg-gray-100 py-4 px-6 flex justify-between items-center font-semibold">
      <div class="w-1/12 text-left">
        <input v-model="allSelected" type="checkbox" @change="toggleSelectAll">
      </div>

      <div class="w-1/3 text-left text-base">조직 이름</div>
      <div class="w-1/3 text-left text-base">리포지토리 이름</div>
      <div class="w-1/3 text-center text-base">최근 업데이트</div>
    </div>

    <div v-for="org in repositories" :key="org.org.id">
      <div v-for="repository in org.org.repositories" :key="repository.id"
           class="repository bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center hover:bg-gray-100">
        <div class="w-1/12 text-left">
          <input v-model="repository.selected" type="checkbox">
        </div>
        <div class="w-1/3 text-left flex items-center">
          <button class="text-yellow-500 mr-2" @click="toggleStar(repository.id)">
            {{ repository.star ? '★' : '☆' }}
          </button>
          <span class="org text-base font-bold mr-3">{{ org.org.name }}</span>
        </div>
        <div class="w-1/3 text-left">
          <router-link :to="`/${org.org.name}/${repository.name}/issues`"
                       class="text-base font-bold text-blue-500 hover:text-blue-800">
            {{ repository.name }}
          </router-link>
        </div>
        <div class="w-1/3 text-center">
          <p class="text-base text-gray-700">{{ repository.updatedAt }}</p>
        </div>
      </div>
    </div>

    <Notification :message="notificationMessage" :show="showNotification" :type="notificationType"/>
  </div>
</template>

<script>
import {computed, defineComponent, onMounted, ref} from 'vue';
import {useAuthStore, useRepositoryStore, useStarStore} from '@/store/pinia';
import {useRoute} from 'vue-router';
import clickOutside from '@/directives/clickOutside';
import axios from 'axios';
import Notification from '@/components/RepositoryNotificationPage.vue';

export default defineComponent({
  name: 'RepositoryList',
  directives: {
    clickOutside
  },
  components: {
    Notification
  },
  props: {
    starred: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const store = useStarStore();
    const route = useRoute();
    const hideAddBox = computed(() => route.meta.hideAddBox);
    const hideListName = computed(() => route.meta.hideListName);
    const adding = ref(false);
    const newRepositoryUrl = ref('');
    const showNotification = ref(false);
    const notificationType = ref('success');
    const notificationMessage = ref('');
    const repositoriesStore = useRepositoryStore();
    const repositories = computed(() => repositoriesStore.repositories);

    const filteredRepositories = computed(() => {
      return props.starred
          ? repositories.value.map(org => ({
            ...org,
            org: {
              ...org.org,
              repositories: org.org.repositories.filter(repository => repository.star)
            }
          }))
          : repositories.value;
    });

    const toggleStar = (id) => {
      store.toggleRepositoryStar(id);
      for (const org of repositories.value) {
        const repo = org.org.repositories.find(repo => repo.id === id);
        if (repo) {
          repo.star = !repo.star;
        }
      }
    };

    const startAdding = () => {
      adding.value = true;
    };

    const cancelAdding = () => {
      adding.value = false;
      newRepositoryUrl.value = '';
    };

    const showNotificationMessage = (type, message) => {
      notificationType.value = type;
      notificationMessage.value = message;
      showNotification.value = true;
      setTimeout(() => {
        showNotification.value = false;
      }, 3000);
    };

    const addRepository = () => {
      if (newRepositoryUrl.value) {
        if (validateGithubUrl(newRepositoryUrl.value)) {
          console.log('Repository URL:', newRepositoryUrl.value);
          newRepositoryUrl.value = newRepositoryUrl.value.toLowerCase();
          requestAddRepository(newRepositoryUrl.value)
              .then(() => {
                showNotificationMessage('success', '리포지토리 추가 완료');
                cancelAdding();
                getRepositories().then(data => {
                  repositories.value = data;
                });
              })
              .catch(error => {
                console.error('Error adding repository:', error);
                showNotificationMessage('error', '해당 리포지토리를 찾을수 없습니다');
              });
        } else {
          showNotificationMessage('error', '올바른 URL을 입력하세요');
        }
      } else {
        showNotificationMessage('error', 'URL을 입력하세요');
      }
    };

    const allSelected = ref(false);

    const toggleSelectAll = () => {
      repositories.value.forEach(org => {
        org.org.repositories.forEach(repo => {
          repo.selected = allSelected.value;
        });
      });
    };

    const hasSelectedRepositories = computed(() => {
      return repositories.value.some(org => org.org.repositories.some(repo => repo.selected));
    });

    const deleteSelectedRepositories = async () => {
      const selectedRepoIds = repositories.value.flatMap(org =>
          org.org.repositories.filter(repo => repo.selected).map(repo => repo.id)
      );

      try {
        await Promise.all(selectedRepoIds.map(repoId => deleteRepository(repoId)));
        showNotificationMessage('success', '선택한 리포지토리가 삭제되었습니다.');
        repositories.value = await getRepositories();
        allSelected.value = false;
      } catch (error) {
        console.error('Error deleting repositories:', error);
        showNotificationMessage('error', '리포지토리 삭제 중 오류가 발생했습니다.');
      }
    };

    onMounted(async () => {
      repositories.value = await getRepositories();
    });

    return {
      repositories,
      filteredRepositories,
      toggleStar,
      hideAddBox,
      hideListName,
      adding,
      newRepositoryUrl,
      startAdding,
      cancelAdding,
      showNotification,
      notificationType,
      notificationMessage,
      showNotificationMessage,
      addRepository,
      allSelected,
      toggleSelectAll,
      hasSelectedRepositories,
      deleteSelectedRepositories
    };
  }
});

async function getRepositories() {
  const authStore = useAuthStore();
  const accessToken = authStore.accessToken;
  const repositoriesStore = useRepositoryStore();

  try {
    const response = await axios.get(`${process.env.VUE_APP_API_URL}/subscription`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const repositories = response.data.map(org => ({
      ...org,
      org: {
        ...org.org,
        repositories: org.org.repositories.map(repo => ({
          ...repo,
          selected: false
        }))
      }
    }));

    repositoriesStore.setRepositories(repositories);
    console.log(repositories)
    return repositories;
  } catch (error) {
    console.error('Error fetching repositories:', error);
    return error;
  }
}

async function requestAddRepository(repositoryUrl) {
  const authStore = useAuthStore();
  const accessToken = authStore.accessToken;

  const response = await axios.post(`${process.env.VUE_APP_API_URL}/subscription`,
      {
        repositoryUrl: repositoryUrl
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
  );
  return response.data;
}

async function deleteRepository(repositoryId) {
  const authStore = useAuthStore();
  const accessToken = authStore.accessToken;

  try {
    await axios.delete(`${process.env.VUE_APP_API_URL}/subscription/${repositoryId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  } catch (error) {
    console.error('Error deleting repository:', error);
    throw error;
  }
}

function validateGithubUrl(url) {
  const githubUrlPattern = /^https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+/;
  return githubUrlPattern.test(url);
}
</script>

<style scoped>
input[type="checkbox"] {
  width: 14px;
  height: 14px;
}

.repository {
  transition: background-color 0.3s;
}

.repository:hover {
  background-color: #f3f4f6;
}

.repository-header {
  background-color: #f3f4f6;
}

.input-full-width {
  width: 400px;
}
</style>