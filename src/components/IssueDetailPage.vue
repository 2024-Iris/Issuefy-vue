<template>
  <div class="container mx-auto mt-6 max-w-7xl font-sans">
    <div class="bg-white border border-gray-200 rounded-lg shadow">
      <div class="px-4 py-5 sm:px-6">
        <div class="flex justify-between items-center">
          <h1 class="text-lg leading-6 font-medium text-gray-900">{{ issue.title }}</h1>
          <div>
            <span
                :class="{'bg-green-100 text-green-800': issue.status === 'open', 'bg-red-100 text-red-800': issue.status === 'closed'}"
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
              {{ issue.status }}
            </span>
          </div>
        </div>
        <div class="mt-1 max-w-2xl text-sm text-gray-500">
          #{{ issue.id }} opened by {{ issue.author }} on {{ issue.createdAt }}
        </div>
      </div>
      <div class="border-t border-gray-200">
        <div class="px-4 py-5 sm:p-6">
          <div class="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{{ issue.body }}</div>
        </div>
        <div v-if="issue.labels.length > 0" class="px-4 py-4 sm:px-6">
          <span v-for="label in issue.labels" :key="label"
                :style="{ backgroundColor: getColorForLabel(label), color: getTextColorForLabel(label) }"
                class="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium leading-5 mr-2">
            {{ label }}
          </span>
        </div>
      </div>
      <div class="bg-gray-50 px-4 py-4 sm:px-6">
        <div class="text-sm">
          <span class="text-gray-600">{{ issue.comments.length }} comments</span>
        </div>
      </div>
      <div v-for="comment in issue.comments" :key="comment.id" class="border-t border-gray-200">
        <div class="px-4 py-4 sm:px-6">
          <div class="flex justify-between items-center">
            <div class="text-sm font-medium text-gray-900">{{ comment.author }}</div>
            <div class="text-sm text-gray-500">{{ comment.createdAt }}</div>
          </div>
          <div class="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{{ comment.body }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'IssueDetailPage',
  props: ['org', 'repository', 'issueId'],
  data() {
    return {
      issue: {
        id: 1,
        title: '이슈 제목',
        status: 'open',
        author: '로이',
        createdAt: '2023-06-08',
        body: '테스트 이슈 바디입니다.',
        labels: ['bug', 'enhancement'],
        comments: [
          {
            id: 1,
            author: '하나',
            createdAt: '2023-06-09',
            body: '첫번째 댓글입니다!',
          },
        ],
      },
    };
  },
  methods: {
    getColorForLabel(label) {
      return label === 'bug' ? '#d73a4a' : '#a2eeef';
    },
    getTextColorForLabel(label) {
      return label === 'bug' ? '#fff' : '#000';
    },
  },
};
</script>