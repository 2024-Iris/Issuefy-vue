<template>
  <div class="container mx-auto mt-6">
    <div class="header bg-gray-900 text-white py-4 px-6 flex justify-between items-center">
      <h1 class="text-lg">이슈 목록</h1>
    </div>
    <div v-for="issue in issues" :key="issue.id"
         class="issue bg-white border-b border-gray-200 p-4 flex justify-between items-center hover:bg-gray-100">
      <div>
        <h2 class="text-xl font-semibold">{{ issue.title }}</h2>
        <div class="tags">
          <span v-for="tag in issue.tags" :key="tag"
                class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">{{
              tag
            }}</span>
        </div>
      </div>
      <div class="issue-info text-right">
        <span class="status text-sm font-semibold"
              :class="{'text-green-500': issue.status === 'open', 'text-red-500': issue.status === 'closed'}">{{
            issue.status
          }}</span>
        <p class="text-sm text-gray-600">{{ issue.updatedAt }}</p>
      </div>

      <div>
        <router-link :to="'/issues/' + issue.id" class="text-blue-500 hover:text-blue-800">상세 보기</router-link>
      </div>
    </div>
  </div>
</template>
<script>
export default {
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
.header {
  background-color: #2d333b;
}

.issue {
  transition: background-color 0.3s;
}

.issue:hover {
  background-color: #f3f4f6;
}

.tags span {
  margin-right: 4px;
}
</style>