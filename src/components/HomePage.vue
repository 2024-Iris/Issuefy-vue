<template>
  <div class="container mx-auto mt-6 max-w-7xl font-sans">
    <div class="text-black py-4 px-6 flex justify-between items-center font-bold">
      <h1 class="text-lg text-left">대시보드</h1>
    </div>

    <section class="mt-2">
      <DashBoardPage/>
    </section>

    <section class="mt-2">
      <RepositoryList :starred="true"/>
    </section>

    <section class="mt-2">
      <IssueStarPage/>
    </section>
  </div>
</template>

<script>
import RepositoryList from '@/components/RepositoryPage.vue'
import IssueStarPage from '@/components/IssueStarPage.vue'
import {useRoute} from "vue-router";
import {computed} from "vue";
import DashBoardPage from "@/components/DashBoardPage.vue";

export default {
  name: 'HomePage',
  components: {
    RepositoryList,
    IssueStarPage,
    DashBoardPage
  },
  setup() {
    const route = useRoute()
    const hideAddBox = computed(() => route.meta.hideAddBox)
    return {
      hideAddBox
    }
  },
}
</script>

<style scoped>
h2 {
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}
</style>