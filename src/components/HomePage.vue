<template>
  <div class="container mx-auto mt-6 max-w-7xl font-sans">
    <div class="text-black py-4 px-6 flex justify-between items-center font-bold">
      <h1 class="text-lg text-left">대시보드</h1>
    </div>

    <section class="mt-2">
      <RepositoryList :starred="true"/>
    </section>

    <section class="mt-2">
      <IssueList :org="org" :repository="repository" :starred="true"/>
    </section>
  </div>
</template>

<script>
import RepositoryList from '@/components/RepositoryPage.vue'
import IssueList from '@/components/IssuePage.vue'
import {useRoute} from "vue-router";
import {computed} from "vue";

export default {
  name: 'HomePage',
  components: {
    RepositoryList,
    IssueList
  },
  setup() {
    const route = useRoute()
    const hideAddBox = computed(() => route.meta.hideAddBox)
    return {
      org: 'elastic',
      repository: 'elasticsearch',
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
