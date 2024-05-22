<template>
  <div class="container mx-auto mt-6 max-w-7xl font-sans">
    <div class="text-black py-4 px-6 flex justify-between items-center font-bold">
      <div v-if="!hideListName">
        <h1 class="text-base text-left font-bold">리포지토리 목록</h1>
      </div>
      <div v-if="!hideAddBox" class="flex items-center space-x-4 w-2/3 justify-end">
        <div v-if="adding" v-click-outside="cancelAdding" class="flex items-center space-x-2">
          <input
              v-model="newRepositoryUrl"
              @keyup.enter="addRepository"
              type="text"
              id="newRepositoryUrl"
              name="newRepositoryUrl"
              placeholder="Enter Repository URL"
              class="input-full-width font-thin px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
          />
          <button @click="addRepository"
                  class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm">
            추가
          </button>
          <button @click="cancelAdding"
                  class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm">
            취소
          </button>
        </div>
        <button v-if="!adding" @click="startAdding"
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm">
          리포지토리 추가
        </button>
      </div>
    </div>

    <div class="repository-header bg-gray-100 py-4 px-6 flex justify-between items-center font-semibold">
      <div class="w-1/3 text-left text-base">조직 이름</div>
      <div class="w-1/3 text-left text-base">리포지토리 이름</div>
      <div class="w-1/3 text-center text-base">최근 업데이트</div>
    </div>

    <div v-for="org in repositories" :key="org.org.id">
      <div v-for="repository in org.org.repositories" :key="repository.id"
           class="repository bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center hover:bg-gray-100">
        <div class="w-1/3 text-left flex items-center">
          <button @click="toggleStar(repository.id)" class="text-yellow-500 mr-2">
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

    <Notification :show="showNotification" :type="notificationType" :message="notificationMessage"/>
  </div>
</template>

<script>
import {computed, defineComponent, onMounted, ref} from 'vue';
import {useAuthStore, useStarStore} from '@/store/pinia';
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
    const repositories = ref([]);
    const showNotification = ref(false);
    const notificationType = ref('success');
    const notificationMessage = ref('');

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
      // Update local repository data to reflect the change
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
          // 여기에 리포지토리 추가 로직을 구현하세요.
          showNotificationMessage('success', '리포지토리 추가 완료');
          cancelAdding();
        } else {
          showNotificationMessage('error', '올바른 URL을 입력하세요');
        }
      } else {
        showNotificationMessage('error', 'URL을 입력하세요');
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
      addRepository
    };
  }
});

async function getRepositories() {
  const authStore = useAuthStore();
  const accessToken = authStore.accessToken;

  try {
    const response = await axios.get('http://localhost:8080/api/subscribe', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching repositories:', error);
    return [];
  }
}

function validateGithubUrl(url) {
  const githubUrlPattern = /^https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+/;
  return githubUrlPattern.test(url);
}
</script>

<style scoped>
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