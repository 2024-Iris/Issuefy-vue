<template>
  <div class="container mx-auto mt-6 max-w-7xl font-sans">
    <div class="text-black py-4 px-6 flex justify-between items-center font-bold">
      <div v-if="!hideListName">
        <h1 class="text-base text-left font-bold">리포지토리 목록</h1>
      </div>
      <div v-if="!hideAddBox" class="flex items-center space-x-4 w-2/3 justify-end">
        <div v-if="adding" v-click-outside="cancelAdding" class="flex items-center space-x-2">
          <input
              v-model="newRepositoryUrl"
              @keyup.enter="addRepository"
              type="text"
              id="newRepositoryUrl"
              name="newRepositoryUrl"
              placeholder="Enter Repository URL"
              class="input-full-width font-thin px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
          />
          <button @click="addRepository"
                  class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm">
            추가
          </button>
          <button @click="cancelAdding"
                  class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm">
            취소
          </button>
        </div>
        <button v-if="!adding" @click="startAdding"
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm">
          리포지토리 추가
        </button>
      </div>
    </div>

    <div class="repository-header bg-gray-100 py-4 px-6 flex justify-between items-center font-semibold">
      <div class="w-1/3 text-left text-base">조직 이름</div>
      <div class="w-1/3 text-left text-base">리포지토리 이름</div>
      <div class="w-1/3 text-center text-base">최근 업데이트</div>
    </div>
    <div v-for="repository in filteredRepositories" :key="repository.id"
         class="repository bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center hover:bg-gray-100">
      <div class="w-1/3 text-left flex items-center">
        <button @click="toggleStar(repository.id)" class="text-yellow-500 mr-2">
          {{ repository.star ? '★' : '☆' }}
        </button>
        <span class="org text-base font-bold mr-3"
              :class="{'text-purple-600': repository.org.length > 0}">{{ repository.org.join(', ') }}</span>
      </div>
      <div class="w-1/3 text-left">
        <router-link :to="`/${repository.org[0]}/${repository.name}/issues`"
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
import {computed, defineComponent, ref} from 'vue';
import {useStarStore} from '@/store/pinia';
import {useRoute} from 'vue-router';
import clickOutside from '@/directives/clickOutside';

export default defineComponent({
  name: 'RepositoryList',
  directives: {
    clickOutside
  },
  props: {
    starred: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const store = useStarStore();
    const route = useRoute();
    const hideAddBox = computed(() => route.meta.hideAddBox);
    const hideListName = computed(() => route.meta.hideListName);
    const adding = ref(false);
    const newRepositoryUrl = ref('');

    const filteredRepositories = computed(() => {
      return props.starred
          ? store.repositories.filter(repository => repository.star)
          : store.repositories;
    });

    const toggleStar = (id) => {
      store.toggleRepositoryStar(id);
    };

    const startAdding = () => {
      adding.value = true;
    };

    const cancelAdding = () => {
      adding.value = false;
      newRepositoryUrl.value = '';
    };

    const addRepository = () => {
      if (newRepositoryUrl.value) {
        console.log('Repository URL:', newRepositoryUrl.value);
        // 여기에 리포지토리 추가 로직을 구현하세요.
        cancelAdding();
      }
    };

    return {
      filteredRepositories,
      toggleStar,
      hideAddBox,
      hideListName,
      adding,
      newRepositoryUrl,
      startAdding,
      cancelAdding,
      addRepository
    };
  }
});
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

.input-full-width {
  width: 400px;
}
</style>
