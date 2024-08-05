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
      <div class="w-1/3 text-left text-base cursor-pointer" @click="changeSort('orgName')">
        조직 이름
        <span v-if="sortBy === 'orgName'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
      </div>
      <div class="w-1/3 text-left text-base cursor-pointer" @click="changeSort('name')">
        리포지토리 이름
        <span v-if="sortBy === 'name'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
      </div>
      <div class="w-1/3 text-center text-base cursor-pointer" @click="changeSort('latestUpdateAt')">
        최근 업데이트
        <span v-if="sortBy === 'latestUpdateAt'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
      </div>
    </div>

    <div v-for="repository in paginatedRepositories" :key="repository.id"
         :class="[
           'repository border-b border-gray-200 py-4 px-6 flex justify-between items-center',
           formatDate(repository.latestUpdateAt).isRecent
         ]">
      <div class="w-1/12 text-left">
        <input v-model="repository.selected" type="checkbox">
      </div>
      <div class="w-1/3 text-left flex items-center">
        <button class="text-yellow-500 mr-2" @click="toggleStar(repository.orgId, repository.id)">
          {{ repository.starred ? '★' : '☆' }}
        </button>
        <span class="org text-base font-bold mr-3">{{ repository.orgName }}</span>
      </div>
      <div class="w-1/3 text-left">
        <router-link :to="`/${repository.orgName}/${repository.name}/issues`"
                     class="text-base font-bold text-blue-500 hover:text-blue-800">
          {{ repository.name }}
        </router-link>
      </div>
      <div class="w-1/3 text-center flex items-center justify-center">
        <font-awesome-icon
            v-if="formatDate(repository.latestUpdateAt).isRecent"
            icon="bell"
            class="mr-2 text-sky-500"
        />
        <p :class="[
           'text-base',
           formatDate(repository.latestUpdateAt).isRecent ? 'font-bold text-sky-500' : 'text-gray-700'
         ]">
          {{ formatDate(repository.latestUpdateAt).formattedDate }}
        </p>
      </div>
    </div>

    <!-- 페이지네이션 -->
    <div v-if="!hideListName" class="pagination flex justify-center mt-4">
      <button v-for="page in totalPages" :key="page"
              :class="['mx-1 px-3 py-1 rounded', currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-200']"
              @click="changePage(page)">
        {{ page }}
      </button>
    </div>

    <Notification :message="notificationMessage" :show="showNotification" :type="notificationType"/>
  </div>
</template>

<script>
import {computed, defineComponent, onMounted, ref} from 'vue';
import {useAuthStore, useRepositoryStore} from '@/store/pinia';
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

    const sortBy = ref('latestUpdateAt');
    const sortOrder = ref('desc');

    const filteredRepositories = computed(() => {
      return props.starred
          ? repositories.value.map(org => ({
            ...org,
            org: {
              ...org.org,
              repositories: org.org.repositories.filter(repository => repository.starred)
            }
          }))
          : repositories.value;
    });

    const itemsPerPage = 15;
    const currentPage = ref(1);

    const sortedRepositories = computed(() => {
      return filteredRepositories.value.flatMap(org =>
          org.org.repositories.map(repo => ({
            ...repo,
            orgName: org.org.name,
            orgId: org.org.id
          }))
      ).sort((a, b) => {
        if (a.starred !== b.starred) {
          return b.starred ? 1 : -1;
        }

        if (sortBy.value === 'latestUpdateAt') {
          return sortOrder.value === 'asc'
              ? new Date(a.latestUpdateAt) - new Date(b.latestUpdateAt)
              : new Date(b.latestUpdateAt) - new Date(a.latestUpdateAt);
        } else if (sortBy.value === 'orgName') {
          return sortOrder.value === 'asc'
              ? a.orgName.localeCompare(b.orgName)
              : b.orgName.localeCompare(a.orgName);
        } else if (sortBy.value === 'name') {
          return sortOrder.value === 'asc'
              ? a.name.localeCompare(b.name)
              : b.name.localeCompare(a.name);
        }
      });
    });

    const paginatedRepositories = computed(() => {
      const startIndex = (currentPage.value - 1) * itemsPerPage;
      return sortedRepositories.value.slice(startIndex, startIndex + itemsPerPage);
    });

    const totalPages = computed(() =>
        Math.ceil(sortedRepositories.value.length / itemsPerPage)
    );

    const changePage = (page) => {
      currentPage.value = page;
    };

    const changeSort = (newSortBy) => {
      if (sortBy.value === newSortBy) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
      } else {
        sortBy.value = newSortBy;
        sortOrder.value = 'asc';
      }
    };

    const getSortDescription = () => {
      const sortDescription = {
        orgName: '조직 이름',
        name: '리포지토리 이름',
        latestUpdateAt: '최근 업데이트'
      };
      return `${sortDescription[sortBy.value]} (${sortOrder.value === 'asc' ? '오름차순' : '내림차순'})`;
    };

    const toggleStar = async (orgId, repoId) => {
      try {
        const authStore = useAuthStore();
        const accessToken = authStore.accessToken;

        const starredCount = sortedRepositories.value.filter(repo => repo.starred).length;
        const repo = sortedRepositories.value.find(r => r.id === repoId);

        if (!repo.starred && starredCount >= 10) {
          showNotificationMessage('error', '즐겨찾기는 최대 10개만 설정 가능합니다.');
          return;
        }

        await axios.put(`${process.env.VUE_APP_API_URL}/subscription/star/${repoId}`, {}, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

        const org = repositories.value.find(o => o.org.id === orgId);
        if (org) {
          const repo = org.org.repositories.find(r => r.id === repoId);
          if (repo) {
            repo.starred = !repo.starred;
          }
        }
      } catch (error) {
        console.error('Error toggling star:', error);
        showNotificationMessage('error', '즐겨찾기 변경 중 오류가 발생했습니다.');
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

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const now = new Date();

      const kstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
      const kstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000));

      const diff = kstNow - kstDate;
      const isRecent = diff < 24 * 60 * 60 * 1000; // 24시간 이내

      const formattedDate = kstDate.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Seoul'
      });

      return {formattedDate, isRecent};
    };

    onMounted(async () => {
      repositories.value = await getRepositories();
    });

    return {
      repositories,
      filteredRepositories,
      paginatedRepositories,
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
      deleteSelectedRepositories,
      formatDate,
      currentPage,
      totalPages,
      changePage,
      sortBy,
      sortOrder,
      changeSort,
      getSortDescription
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

    const repositories = response.data.map(item => ({
      ...item,
      org: {
        ...item.org,
        repositories: item.org.repositories.map(repo => ({
          ...repo,
          selected: false
        }))
      }
    }));

    repositoriesStore.setRepositories(repositories);
    console.log(repositories);
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