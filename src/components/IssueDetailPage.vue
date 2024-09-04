<template>
  <div v-if="isLoaded" class="container mx-auto mt-6 max-w-7xl font-sans">
    <div class="bg-white border border-gray-300 rounded-lg">
      <!-- Issue Header -->
      <div class="px-6 py-4 border-b border-gray-300">
        <h1 class="text-2xl font-bold text-gray-900">{{ issue.title }} <span
            class="text-gray-500 font-normal">#{{ issue.number }}</span></h1>
        <div class="mt-2 flex items-center">
          <span
              :class="{'bg-green-600 text-white': issue.state === 'open', 'bg-red-600 text-white': issue.state === 'closed'}"
              class="px-2 py-1 text-xs font-medium rounded-full mr-2">
            {{ issue.state }}
          </span>
          <span class="text-gray-600 text-sm flex items-center">
            <img :src="issue.user.avatar_url" alt="User Avatar" class="w-5 h-5 rounded-full mr-1">
            <strong>{{ issue.user.login }}</strong> &nbsp; opened this issue on {{
              formatDate(issue.created_at)
            }} · {{ comments.length }} comments
          </span>
        </div>
      </div>

      <!-- Issue Body -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex-grow overflow-x-auto">
          <div class="bg-white rounded-lg mb-2">
            <div class="prose max-w-none text-gray-700 markdown-body" v-html="renderMarkdown(issue.body)"></div>
          </div>
          <div v-if="issue.labels.length > 0" class="mt-2">
            <span v-for="label in issue.labels" :key="label.id"
                  :style="{ backgroundColor: `#${label.color}`, color: getContrastColor(label.color) }"
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mr-2">
              {{ label.name }}
            </span>
          </div>
        </div>
      </div>

      <!-- Comments -->
      <div v-for="comment in comments" :key="comment.id" class="border-b border-gray-200">
        <div class="px-6 py-2 bg-gray-50">
          <div class="text-sm font-medium text-gray-700 flex items-center">
            <img :src="comment.user.avatar_url" alt="User Avatar" class="w-5 h-5 rounded-full mr-1">
            {{ comment.user.login }} commented on {{ formatDate(comment.created_at) }}
          </div>
        </div>
        <div class="px-6 py-4">
          <div class="flex-grow">
            <div class="bg-white rounded-lg">
              <div class="prose max-w-none text-gray-700 markdown-body" v-html="renderMarkdown(comment.body)"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, ref, getCurrentInstance } from 'vue';
import { useAuthStore } from '@/store/pinia';
import axios from "axios";

export default {
  name: 'IssueDetailPage',
  props: ['org', 'repository', 'issueId'],
  setup(props) {
    const { proxy } = getCurrentInstance();
    const authStore = useAuthStore();
    const issue = ref({});
    const comments = ref([]);
    const isLoaded = ref(false);

    const fetchIssueDetails = async () => {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_URL}/subscriptions/${props.org}/${props.repository}/issues/${props.issueId}`, {
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`
          }
        });
        issue.value = response.data.issueDetailDto;
        comments.value = response.data.comments;
        isLoaded.value = true;
      } catch (error) {
        console.error('Error fetching issue details:', error);
      }
    };

    onMounted(fetchIssueDetails);

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);

      const kstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));

      return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Seoul'
      }).format(kstDate);
    };

    const getContrastColor = (hexcolor) => {
      const r = parseInt(hexcolor.substr(0, 2), 16);
      const g = parseInt(hexcolor.substr(2, 2), 16);
      const b = parseInt(hexcolor.substr(4, 2), 16);
      const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
      return (yiq >= 128) ? 'black' : 'white';
    };

    const renderMarkdown = (content) => {
      if (!content) return '';
      return proxy.$md.render(content);
    };

    return {
      issue,
      comments,
      isLoaded,
      formatDate,
      getContrastColor,
      renderMarkdown
    };
  }
};
</script>

<style scoped>
.markdown-body {
  font-size: 15px;
  line-height: 1.5;
  word-wrap: break-word;
}

@media (max-width: 767px) {
  .markdown-body {
    padding: 15px;
  }
}

.markdown-body pre {
  white-space: pre-wrap;
}

</style>