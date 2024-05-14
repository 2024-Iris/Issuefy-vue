<template>
  <div class="container mx-auto mt-6 max-w-7xl font-sans">
    <div class="text-black py-4 px-6 flex justify-between items-center font-bold">
      <h1 class="text-base text-left">이슈 목록</h1>
    </div>
    <div class="repository-header bg-gray-100 py-4 px-6 flex justify-between items-center font-semibold">
      <div class="w-1/3 text-left text-base">이슈 제목</div>
      <div class="w-1/3 text-left text-base">태그</div>
      <div class="w-1/3 text-center text-base">상태 및 업데이트 날짜</div>
    </div>
    <div v-for="issue in issues" :key="issue.id"
         class="issue bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center hover:bg-gray-100">
      <div class="w-1/3 text-left">
        <router-link :to="'/issues/' + issue.id" class="text-base font-bold text-blue-500 hover:text-blue-800">
          {{ issue.title }}
        </router-link>
      </div>
      <div class="w-1/3 text-left text-base">
        <div class="tags">
          <span v-for="tag in issue.tags" :key="tag"
                class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">{{ tag }}</span>
        </div>
      </div>
      <div class="w-1/3 text-center">
        <span class="status text-sm font-semibold"
              :class="{'text-green-500': issue.status === 'open', 'text-red-500': issue.status === 'closed'}">{{ issue.status }}</span>
        <p class="text-sm text-gray-600">{{ issue.updatedAt }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'IssueList',
  data() {
    return {
      issues: [
        {
          id: 1,
          title: "첫번째 이슈 제목",
          tags: ["bug", "performance"],
          status: "open",
          updatedAt: "2024-05-13"
        },
        {
          id: 2,
          title: "두번째 이슈 제목",
          tags: ["good first issue"],
          status: "closed",
          updatedAt: "2024-05-12"
        },
        {
          id: 3,
          title: "세번째 이슈 제목",
          tags: ["enhancement", "auth"],
          status: "open",
          updatedAt: "2024-05-14"
        }
      ]
    };
  }
}
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
