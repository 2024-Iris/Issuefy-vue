<template>
  <div class="container mx-auto mt-6 max-w-7xl font-sans">
    <div class="text-black py-4 px-6 flex justify-between items-center font-bold">
      <h1 v-if="!hideListName" class="text-base text-left">이슈 목록</h1>
    </div>
    <div class="repository-header bg-gray-100 py-4 px-6 flex justify-between items-center font-semibold">
      <div class="w-1/3 text-left text-base">이슈 제목</div>
      <div class="w-1/3 text-left text-base">태그</div>
      <div class="w-1/3 text-center text-base">상태 및 업데이트 날짜</div>
    </div>
    <div v-for="issue in filteredIssues" :key="issue.id"
         class="issue bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center hover:bg-gray-100">
      <div class="w-1/3 text-left flex items-center">
        <button class="text-yellow-500 mr-2" @click="toggleStar(issue.id)">
          {{ issue.star ? '★' : '☆' }}
        </button>
        <router-link :to="`/${org}/${repository}/issues/` + issue.id"
                     class="text-base font-bold text-blue-500 hover:text-blue-800">
          {{ issue.title }}
        </router-link>
      </div>
      <div class="w-1/3 text-left text-base">
        <div class="tags">
          <span v-for="tag in issue.tags" :key="tag"
                class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">{{
              tag
            }}</span>
        </div>
      </div>
      <div class="w-1/3 text-center">
        <span :class="{'text-green-500': issue.status === 'open', 'text-red-500': issue.status === 'closed'}"
              class="status text-sm font-semibold">{{
            issue.status
          }}</span>
        <p class="text-sm text-gray-600">{{ issue.updatedAt }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import {computed, defineComponent} from 'vue';
import {useStarStore} from '@/store/pinia';
import {useRoute} from "vue-router";

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
    const store = useStarStore();
    const route = useRoute()
    const hideListName = computed(() => route.meta.hideListName)
    const filteredIssues = computed(() => {
      return props.starred
          ? store.issues.filter(issue => issue.star)
          : store.issues;
    });

    const toggleStar = (id) => {
      store.toggleIssueStar(id);
    };

    return {
      filteredIssues,
      toggleStar,
      hideListName
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

.tags span {
  margin-right: 4px;
}
</style>
