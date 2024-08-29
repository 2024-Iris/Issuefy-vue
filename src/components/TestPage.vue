<template>
  <div class="github-stats">
    <svg width="495" height="195" xmlns="http://www.w3.org/2000/svg">
      <!-- 배경 및 기본 레이아웃 -->
      <rect width="495" height="195" fill="#030314" rx="4.5" stroke="#85A4C0"/>
      <line x1="165" y1="28" x2="165" y2="170" stroke="#2A4555" />
      <line x1="330" y1="28" x2="330" y2="170" stroke="#2A4555" />

      <!-- 주간 방문 횟수 -->
      <g transform="translate(82.5, 48)">
        <text x="0" y="32" text-anchor="middle" :fill="weeklyVisitsColor" font-size="28" font-weight="700">
          {{ stats.weeklyVisits }}
        </text>
        <text x="0" y="68" text-anchor="middle" fill="#D6E7FF" font-size="14">
          주간 방문 횟수
        </text>
      </g>

      <!-- 합산 랭크 -->
      <g transform="translate(247.5, 48)">
        <text x="0" y="32" text-anchor="middle" :fill="rankColor" font-size="28" font-weight="700">
          {{ stats.totalRank }}
        </text>
        <text x="0" y="68" text-anchor="middle" fill="#D6E7FF" font-size="14">
          합산 랭크
        </text>
      </g>

      <!-- 주간 리포지토리 추가 횟수 -->
      <g transform="translate(412.5, 48)">
        <text x="0" y="32" text-anchor="middle" :fill="weeklyRepoAddsColor" font-size="28" font-weight="700">
          {{ stats.weeklyRepoAdds }}
        </text>
        <text x="0" y="68" text-anchor="middle" fill="#D6E7FF" font-size="14">
          주간 리포지토리 추가
        </text>
      </g>

      <!-- 날짜 범위 -->
      <text x="247.5" y="170" text-anchor="middle" fill="#85A4C0" font-size="12">
        {{ stats.dateRange }}
      </text>
    </svg>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'GitHubStats',
  data() {
    return {
      stats: {
        weeklyVisits: 0,
        totalRank: 'N/A',
        weeklyRepoAdds: 0,
        dateRange: ''
      },
      loading: true,
      error: null
    }
  },
  computed: {
    rankColor() {
      const rankColors = {
        'A': '#5FABEE',  // 현재 색상
        'B': '#FFD700',  // 노란색
        'C': '#FFA500',  // 주황색
        'D': '#FF4500'   // 빨간색
      };
      return rankColors[this.stats.totalRank] || '#5FABEE';
    },
    weeklyVisitsColor() {
      return this.stats.weeklyVisits > 50 ? '#5FABEE' : '#FFA500';
    },
    weeklyRepoAddsColor() {
      return this.stats.weeklyRepoAdds > 5 ? '#5FABEE' : '#FFA500';
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      try {
        this.loading = true;
        const response = await axios.get('/api/github-stats');  // API 엔드포인트 주소
        this.stats = response.data;
      } catch (error) {
        console.error('Failed to fetch GitHub stats:', error);
        this.error = 'Failed to load stats';
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
.github-stats {
  font-family: 'Segoe UI', Ubuntu, sans-serif;
}
</style>