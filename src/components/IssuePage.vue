<template>
  <div class="container mx-auto mt-6 max-w-7xl font-sans">
    <div class="repository-header bg-gray-100 py-4 px-6 flex justify-between items-center font-semibold">
      <div class="w-3/4 text-left text-base flex items-center">
        <div class="w-full">
          <span class="cursor-pointer" @click="changeSort('title')">
            이슈 제목
            <span v-if="sort === 'title'">{{ order === 'asc' ? '▲' : '▼' }}</span>
          </span>
        </div>
      </div>
      <div class="w-1/4 text-left text-base flex justify-between">
        <span class="w-1/3 text-center">상태</span>
        <span class="w-1/3 text-center cursor-pointer" @click="changeSort('createdAt')">
          생성일
          <span v-if="sort === 'createdAt'">{{ order === 'asc' ? '▲' : '▼' }}</span>
        </span>
        <span class="w-1/3 text-center cursor-pointer" @click="changeSort('updatedAt')">
          수정일
          <span v-if="sort === 'updatedAt'">{{ order === 'asc' ? '▲' : '▼' }}</span>
        </span>
      </div>
    </div>
    <div v-for="issue in filteredIssues" :key="issue.id"
         class="issue bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center hover:bg-gray-100">
      <div class="w-3/4 text-left flex items-center">
        <div class="w-full overflow-hidden">
          <div class="flex items-center mb-4">
            <button class="text-yellow-500 mr-2 flex-shrink-0" @click="toggleStar(issue.id)">
              {{ issue.starred ? '★' : '☆' }}
            </button>
            <router-link :to="`/${org}/${repository}/issues/` + issue.id"
                         class="text-base font-bold text-black-500 hover:text-blue-800 overflow-hidden text-ellipsis">
              {{ issue.title }}
            </router-link>
          </div>
          <div class="flex items-center text-xxs mt-2 flex-wrap">
            <span v-for="label in issue.labels" :key="label.name"
                  class="inline-block rounded-full px-2 py-0.5 text-xxs font-semibold mr-1 mb-1"
                  :style="{ backgroundColor: `#${label.color}`, color: getContrastColor(label.color) }">
              {{ label.name }}
            </span>
          </div>
        </div>
      </div>
      <div class="w-1/4 flex justify-between items-center">
        <div class="w-1/3 text-center">
          <div :class="{'text-green-500': issue.state === 'open', 'text-red-500': issue.state === 'closed'}"
               class="text-sm font-semibold">
            {{ issue.state === 'open' ? '●' : '○' }} {{ issue.state }}
          </div>
        </div>
        <div class="w-1/3 text-center flex flex-col">
          <p class="text-sm text-gray-600">{{ formatDate(issue.createdAt).date }}</p>
          <p class="text-sm text-gray-600">{{ formatDate(issue.createdAt).time }}</p>
        </div>
        <div class="w-1/3 text-center flex flex-col">
          <p class="text-sm text-gray-600">{{ formatDate(issue.updatedAt).date }}</p>
          <p class="text-sm text-gray-600">{{ formatDate(issue.updatedAt).time }}</p>
        </div>
      </div>
    </div>

    <!-- 페이지네이션 -->
    <div v-if="!hideListName" class="pagination flex justify-center mt-4">
      <button v-for="page in totalPages" :key="page"
              :class="['mx-1 px-3 py-1 rounded', currentPage + 1 === page ? 'bg-blue-500 text-white' : 'bg-gray-200']"
              @click="changePage(page - 1)">
        {{ page }}
      </button>
    </div>
  </div>
</template>

<script>
import {computed, defineComponent, onMounted, ref, watch} from 'vue';
import {useAuthStore} from '@/store/pinia';
import {useRoute} from "vue-router";
import axios from 'axios';

export default defineComponent({
  name: 'IssueList',
  props: {
    org: {
      type: String,
      required: true
    },
    repository: {
      type: String,
      required: true
    },
    starred: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const authStore = useAuthStore();
    const route = useRoute();
    const hideListName = computed(() => route.meta.hideListName);
    const issues = ref([]);
    const currentPage = ref(0);
    const totalElements = ref(0);
    const totalPages = ref(0);
    const repositoryName = ref('');
    const sort = ref('updatedAt');
    const order = ref('desc');

    const fetchIssues = async () => {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_URL}/subscriptions/${props.org}/${props.repository}/issues`, {
          params: {
            page: currentPage.value,
            sort: sort.value,
            order: order.value,
            starred: hideListName.value
          },
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`
          }
        });
        const data = response.data;
        issues.value = data.issues;
        currentPage.value = data.currentPage;
        totalElements.value = data.totalElements;
        totalPages.value = data.totalPages;
        repositoryName.value = data.repositoryName;
      } catch (error) {
        console.error('Error fetching issues:', error);
      }
    };

    onMounted(fetchIssues);

    watch(hideListName, fetchIssues);

    const filteredIssues = computed(() => {
      return hideListName.value ? issues.value.filter(issue => issue.starred) : issues.value;
    });

    const changeSort = (newSort) => {
      if (sort.value === newSort) {
        order.value = order.value === 'asc' ? 'desc' : 'asc';
      } else {
        sort.value = newSort;
        order.value = 'desc';
      }
      currentPage.value = 0;
      fetchIssues();
    };

    const toggleStar = async (id) => {
      try {
        const issue = issues.value.find(i => i.id === id);
        if (!issue) return;

        await axios.put(`${process.env.VUE_APP_API_URL}/subscriptions/issue_star/${issue.githubIssueId}`, {}, {
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`
          }
        });

        issue.starred = !issue.starred;
      } catch (error) {
        console.error('Error toggling star:', error);
      }
    };

    const formatDate = (dateString) => {
      if (!dateString) return {date: 'N/A', time: 'N/A'};
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).replace(/\. /g, '.'),
        time: date.toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit', hour12: false})
      };
    };

    const changePage = (page) => {
      currentPage.value = page;
      fetchIssues();
    };

    const getContrastColor = (hexcolor) => {
      const r = parseInt(hexcolor.substr(0, 2), 16);
      const g = parseInt(hexcolor.substr(2, 2), 16);
      const b = parseInt(hexcolor.substr(4, 2), 16);

      const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

      return (yiq >= 128) ? 'black' : 'white';
    }

    return {
      issues,
      filteredIssues,
      toggleStar,
      hideListName,
      formatDate,
      currentPage,
      totalPages,
      changePage,
      sort,
      order,
      changeSort,
      getContrastColor,
      repositoryName
    };
  }
});
</script>

<style scoped>
.issue {
  transition: background-color 0.3s;
}

.issue:hover {
  background-color: #f3f4f6;
}

.repository-header {
  background-color: #f3f4f6;
}

.text-xxs {
  font-size: 0.65rem;
}
</style>