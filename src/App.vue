<template>
  <header v-if="!$route.meta.hideHeader" class="bg-white">
    <nav aria-label="Global" class="flex w-full items-center justify-between py-4 lg:px-8 bg-gray-50">
      <div class="flex items-center lg:flex-1">
        <router-link to="/" class="flex items-center">
          <img alt="issuefy logo" class="h-16 w-auto" src="./assets/issuefy-removebg_logo.png"/>
          <div v-if="$route.meta.showBreadcrumbs" class="ml-4 flex items-center space-x-2">
            <router-link :to="`/${$route.params.org}`" class="text-sm font-medium text-gray-900 hover:text-blue-600">
              {{ $route.params.org }}
            </router-link>
            <span class="text-sm font-medium text-gray-500">/</span>
            <router-link :to="`/${$route.params.org}/${$route.params.repository}`"
                         class="text-sm font-medium text-gray-900 hover:text-blue-600">
              {{ $route.params.repository }}
            </router-link>
            <span v-if="$route.params.issueId" class="text-sm font-medium text-gray-500">/</span>
            <span v-if="$route.params.issueId" class="text-sm font-medium text-gray-900">
              {{ $route.meta.issueTitle }}
            </span>
          </div>
        </router-link>
      </div>
      <div v-if="isLoggedIn" class="hidden lg:flex lg:items-center lg:gap-x-6">
        <router-link class="text-sm font-semibold leading-6 text-gray-900" to="/">Home</router-link>
        <router-link class="text-sm font-semibold leading-6 text-gray-900" to="/repositories">Repositories</router-link>
      </div>
      <div v-if="isLoggedIn" class="mx-5"></div>
      <div v-if="isLoggedIn" class="flex items-center gap-x-4">
        <div class="flex items-center space-x-2">
          <img :src="avatarURL" class="w-10 h-10 rounded-full" alt="User Avatar">
          <router-link to="/settings" class="text-sm font-semibold leading-6 text-blue-600 hover:underline">{{
              userName
            }}
          </router-link>
        </div>
        <router-link class="text-sm font-semibold leading-6 text-gray-900" to="/logout">Logout</router-link>
      </div>
      <div v-else class="flex justify-end flex-1">
        <router-link class="text-sm font-semibold leading-6 text-gray-900" to="/login">Login</router-link>
      </div>
      <div v-if="isLoggedIn" class="flex lg:hidden">
        <button class="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700" type="button"
                @click="mobileMenuOpen = true">
          <span class="sr-only">Open main menu</span>
          <Bars3Icon aria-hidden="true" class="h-6 w-6"/>
        </button>
      </div>
    </nav>
    <Dialog :open="mobileMenuOpen" as="div" class="lg:hidden" @close="mobileMenuOpen = false">
      <div class="fixed inset-0 z-10"/>
      <DialogPanel
          class="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
        <div class="flex items-center justify-between">
          <router-link to="/" class="-m-1.5 p-1.5">
            <img alt="issuefy logo" class="h-8 w-auto" src="./assets/issuefy_logo.png"/>
          </router-link>
          <button class="-m-2.5 rounded-md p-2.5 text-gray-700" type="button" @click="mobileMenuOpen = false">
            <span class="sr-only">Close menu</span>
            <XMarkIcon aria-hidden="true" class="h-6 w-6"/>
          </button>
        </div>
        <div class="mt-6 flow-root">
          <div class="-my-6 divide-y divide-gray-500/10">
            <div class="space-y-2 py-6">
              <router-link
                  class="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  to="/">
                Home
              </router-link>
              <router-link
                  class="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  to="/repositories">
                Repositories
              </router-link>
              <router-link
                  class="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  to="/settings">
                Settings
              </router-link>
              <router-link
                  class="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  to="/logout">
                Log out
              </router-link>
            </div>
          </div>
        </div>
      </DialogPanel>
    </Dialog>
  </header>
  <router-view></router-view>
</template>
<script setup>
import {computed, ref} from 'vue'
import {Dialog, DialogPanel} from '@headlessui/vue'
import {Bars3Icon, XMarkIcon} from '@heroicons/vue/24/outline'
import {useAuthStore} from "@/store/pinia"

const authStore = useAuthStore()
const isLoggedIn = computed(() => authStore.isLoggedIn)
const userName = computed(() => authStore.userName)
const avatarURL = computed(() => authStore.avatarURL)

const mobileMenuOpen = ref(false)
</script>