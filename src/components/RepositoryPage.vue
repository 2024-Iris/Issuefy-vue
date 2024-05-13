<template>
  <div class="container mx-auto mt-6">
    <div class="header bg-gray-900 text-white py-4 px-6 flex justify-between items-center">
      <h1 class="text-lg">리포지토리 목록</h1>
      <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        리포지토리 추가
      </button>
    </div>
    <div v-for="repository in repositories" :key="repository.id"
         class="repository bg-white border-b border-gray-200 p-4 flex justify-between items-center hover:bg-gray-100">
      <div class="flex items-center">
        <span class="org text-lg font-semibold mr-3"
              :class="{'text-green-500': repository.org.length > 0}">{{ repository.org.join(', ') }}</span>
        <h2 class="text-xl font-semibold">{{ repository.name }}</h2>
      </div>
      <div class="repository-info text-right">
        <p class="text-sm text-gray-600">{{ repository.updatedAt }}</p>
      </div>
      <div>
        <router-link :to="'/repository/' + repository.id" class="text-blue-500 hover:text-blue-800">상세 보기</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      repositories: [
        {
          id: 1,
          name: "첫번째 리포지토리",
          org: ["elastic"],
          updatedAt: "2024-05-13"
        },
        {
          id: 2,
          name: "두번째 리포지토리",
          org: ["spring-boot"],
          updatedAt: "2024-05-12"
        },
        {
          id: 3,
          name: "세번째 리포지토리",
          org: ["vue"],
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

.repository {
  transition: background-color 0.3s;
}

.repository:hover {
  background-color: #f3f4f6;
}

.tags span {
  margin-right: 4px;
}
</style>