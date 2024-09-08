<template>
  <div class="w-full max-w-4xl mx-auto bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
    <div :class="[
      'flex justify-around items-stretch p-5',
      rankBorderClass
    ]">
      <div class="flex-1 text-center px-3 border-r border-gray-200 last:border-r-0">
        <p class="text-base font-semibold text-black mb-2">주간 랭크</p>
        <div class="h-16 flex items-center justify-center">
          <h2 :class="['text-5xl font-bold leading-none', rankTextClass]">{{ stats.rank }}</h2>
        </div>
      </div>
      <div class="flex-1 text-center px-3 border-r border-gray-200 last:border-r-0">
        <p class="text-base font-semibold text-black mb-2">주간 방문 횟수</p>
        <div class="h-16 flex items-center justify-center">
          <h2 class="text-5xl font-bold leading-none text-gray-800">{{ stats.visitCount }}</h2>
        </div>
      </div>
      <div class="flex-1 text-center px-3 border-r border-gray-200 last:border-r-0">
        <p class="text-base font-semibold text-black mb-2">주간 리포지토리 추가</p>
        <div class="h-16 flex items-center justify-center">
          <h2 class="text-5xl font-bold leading-none text-gray-800">{{ stats.addRepositoryCount }}</h2>
        </div>
      </div>
    </div>
    <div class="border-t border-gray-200 p-2 text-center text-xs text-gray-600 bg-white">
      {{ dateRangeText }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';
import { useAuthStore } from "@/store/pinia";

const authStore = useAuthStore();
const stats = ref({
  rank: 'N/A',
  visitCount: '0',
  addRepositoryCount: '0',
  startDate: '',
  endDate: ''
});

const fetchData = async () => {
  try {
    const response = await axios.get(`${process.env.VUE_APP_API_URL}/dashboard`, {
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`
      }
    });
    stats.value = response.data;
  } catch (err) {
    console.error('Failed to fetch GitHub stats:', err);
  }
};

fetchData();

const rankBorderClass = computed(() => {
  const classes = {
    'S': 'border-t-4 border-t-blue-500',
    'A': 'border-t-4 border-t-blue-400',
    'B': 'border-t-4 border-t-indigo-400',
    'C': 'border-t-4 border-t-purple-400',
    'D': 'border-t-4 border-t-purple-500'
  };
  return classes[stats.value.rank] || '';
});

const rankTextClass = computed(() => {
  const classes = {
    'S': 'text-blue-500',
    'A': 'text-blue-400',
    'B': 'text-indigo-400',
    'C': 'text-purple-400',
    'D': 'text-purple-500'
  };
  return classes[stats.value.rank] || 'text-gray-800';
});

const dateRangeText = computed(() => {
  if (stats.value.startDate && stats.value.endDate) {
    return `${stats.value.startDate} ~ ${stats.value.endDate}`;
  }
  return '';
});
</script>