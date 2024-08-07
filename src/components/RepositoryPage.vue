<template>
  <div class="container mx-auto mt-6 max-w-7xl font-sans">
    <div class="text-black py-4 px-6 flex justify-between items-center font-bold">
      <div v-if="!hideListName">
        <h1 class="text-lg text-left font-bold">리포지토리 목록</h1>
      </div>
      <div v-else>
        <h1 class="text-lg text-left font-bold">즐겨찾기 목록</h1>
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
      <div class="w-1/3 text-left text-base cursor-pointer" @click="changeSort('repositoryName')">
        리포지토리 이름
        <span v-if="sortBy === 'repositoryName'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
      </div>
      <div class="w-1/3 text-center text-base cursor-pointer" @click="changeSort('repositoryLatestUpdateAt')">
        최근 업데이트
        <span v-if="sortBy === 'repositoryLatestUpdateAt'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
      </div>
    </div>

    <div v-for="repository in repositories" :key="repository.githubRepositoryId"
         :class="[
           'repository border-b border-gray-200 py-4 px-6 flex justify-between items-center',
           formatDate(repository.repositoryLatestUpdateAt).isRecent
         ]">
      <div class="w-1/12 text-left">
        <input v-model="repository.selected" type="checkbox">
      </div>
      <div class="w-1/3 text-left flex items-center">
        <button class="text-yellow-500 mr-2" @click="toggleStar(repository.orgId, repository.githubRepositoryId)">
          {{ repository.repositoryStarred ? '★' : '☆' }}
        </button>
        <span class="org text-base font-bold mr-3">{{ repository.orgName }}</span>
      </div>
      <div class="w-1/3 text-left">
        <router-link :to="'/' + repository.orgName + '/' + repository.repositoryName + '/issues'"
                     class="text-base font-bold text-blue-500 hover:text-blue-800">
          {{ repository.repositoryName }}
        </router-link>
      </div>
      <div class="w-1/3 text-center flex items-center justify-center">
        <font-awesome-icon
            v-if="formatDate(repository.repositoryLatestUpdateAt).isRecent"
            icon="bell"
            class="mr-2 text-sky-500"
        />
        <p :class="[
           'text-base',
           formatDate(repository.repositoryLatestUpdateAt).isRecent ? 'font-bold text-sky-500' : 'text-gray-700'
         ]">
          {{ formatDate(repository.repositoryLatestUpdateAt).formattedDate }}
        </p>
      </div>
    </div>

    <!-- 페이지네이션 -->
    <div v-if="!hideListName" class="pagination flex justify-center mt-4">
      <button v-for="page in totalPages" :key="page"
              :class="['mx-1 px-3 py-1 rounded', currentPage + 1 === page ? 'bg-blue-500 text-white' : 'bg-gray-200']"
              @click="changePage(page)">
        {{ page }}
      </button>
    </div>

    <Notification :message="notificationMessage" :show="showNotification" :type="notificationType"/>
  </div>
</template>

<script>
import {computed, defineComponent, onMounted, ref} from 'vue';
import {useAuthStore} from '@/store/pinia';
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
  setup() {
    const route = useRoute();
    const hideAddBox = computed(() => route.meta.hideAddBox);
    const hideListName = computed(() => route.meta.hideListName);
    const adding = ref(false);
    const newRepositoryUrl = ref('');
    const showNotification = ref(false);
    const notificationType = ref('success');
    const notificationMessage = ref('');
    const repositories = ref([]);
    const currentPage = ref(0);
    const totalElements = ref(0);
    const totalPages = ref(0);
    const sortBy = ref('repositoryLatestUpdateAt');
    const sortOrder = ref('desc');

    const changePage = async (page) => {
      try {
        currentPage.value = page - 1;
        const data = await getRepositories(currentPage.value, sortBy.value, sortOrder.value, hideListName.value);
        repositories.value = data.subscriptionListDtos;
        totalPages.value = data.totalPages;
        totalElements.value = data.totalElements;
      } catch (error) {
        console.error('Error changing page:', error);
        showNotificationMessage('error', '페이지 변경 중 오류가 발생했습니다.');
      }
    };

    const changeSort = async (newSortBy) => {
      if (sortBy.value === newSortBy) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
      } else {
        sortBy.value = newSortBy;
        sortOrder.value = 'asc';
      }
      await changePage(1);
    };

    const toggleStar = async (orgId, repoId) => {
      try {
        const authStore = useAuthStore();
        const accessToken = authStore.accessToken;

        const starredCount = repositories.value.filter(repo => repo.repositoryStarred).length;
        const repo = repositories.value.find(r => r.githubRepositoryId === repoId);

        if (!repo.repositoryStarred && starredCount >= 10) {
          showNotificationMessage('error', '즐겨찾기는 최대 10개만 설정 가능합니다.');
          return;
        }

        await axios.put(`${process.env.VUE_APP_API_URL}/subscription/star/${repoId}`, {}, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

        repo.repositoryStarred = !repo.repositoryStarred;
        if (hideListName.value && !repo.repositoryStarred) {
          repositories.value = repositories.value.filter(r => r.githubRepositoryId !== repoId);
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
                changePage(1);
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
      repositories.value.forEach(repo => {
        repo.selected = allSelected.value;
      });
    };

    const hasSelectedRepositories = computed(() => {
      return repositories.value.some(repo => repo.selected);
    });

    const deleteSelectedRepositories = async () => {
      const selectedRepoIds = repositories.value
          .filter(repo => repo.selected)
          .map(repo => repo.githubRepositoryId);

      try {
        await Promise.all(selectedRepoIds.map(repoId => deleteRepository(repoId)));
        showNotificationMessage('success', '선택한 리포지토리가 삭제되었습니다.');
        await changePage(1);
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
      try {
        const data = await getRepositories(0, sortBy.value, sortOrder.value, hideListName.value);
        repositories.value = data.subscriptionListDtos;
        currentPage.value = data.currentPage;
        totalElements.value = data.totalElements;
        totalPages.value = data.totalPages;
      } catch (error) {
        console.error('Error loading initial data:', error);
        showNotificationMessage('error', '데이터 로딩 중 오류가 발생했습니다.');
      }
    });

    return {
      repositories,
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
      changeSort
    };
  }
});

async function getRepositories(page = 0, sort = 'repositoryLatestUpdateAt', order = 'desc', hideListName = false) {
  const authStore = useAuthStore();
  const accessToken = authStore.accessToken;

  try {
    const response = await axios.get(`${process.env.VUE_APP_API_URL}/subscription`, {
      params: {
        page,
        sort,
        order,
        starred: hideListName // hideListName이 true면 starred를 true로, 아니면 false로 설정
      },
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching repositories:', error);
    throw error;
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
