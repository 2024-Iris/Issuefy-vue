<template>
  <div class="container mx-auto mt-6 max-w-7xl font-sans">
    <div class="text-black py-4 px-6 flex justify-between items-center font-bold">
      <h1 class="text-base text-left font-bold">리포지토리 목록</h1>
      <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm">
        리포지토리 추가
      </button>
    </div>
    <div class="repository-header bg-gray-100 py-4 px-6 flex justify-between items-center font-semibold">
      <div class="w-1/3 text-left text-base">조직 이름</div>
      <div class="w-1/3 text-left text-base">리포지토리 이름</div>
      <div class="w-1/3 text-center text-base">최근 업데이트</div>
    </div>
    <div v-for="repository in repositories" :key="repository.id"
         class="repository bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center hover:bg-gray-100">
      <div class="w-1/3 text-left">
        <span class="org text-base font-bold mr-3"
              :class="{'text-purple-600': repository.org.length > 0}">{{ repository.org.join(', ') }}</span>
      </div>
      <div class="w-1/3 text-left">
        <router-link :to="{ name: 'issue', params: { id: repository.id } }"
                     class="text-base font-bold text-blue-500 hover:text-blue-800">
          {{ repository.name }}
        </router-link>
      </div>
      <div class="w-1/3 text-center">
        <p class="text-base text-gray-700">{{ repository.updatedAt }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RepositoryList',
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
.repository {
  transition: background-color 0.3s;
}

.repository:hover {
  background-color: #f3f4f6;
}

.repository-header {
  background-color: #f3f4f6;
}
</style>
