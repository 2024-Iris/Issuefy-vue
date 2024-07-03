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
        <div class="relative">
          <button @click="toggleNotifications" class="relative">
            <font-awesome-icon icon="bell" style="color: #B197FC;"/>
            <span v-if="unreadCount > 0"
                  class="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1">
              {{ unreadCount }}
            </span>
          </button>
          <div v-if="showNotifications" v-click-outside="closeNotifications"
               class="absolute right-0 mt-2 w-80 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
            <div v-if="visibleNotifications.length > 0">
              <div v-for="notification in visibleNotifications" :key="notification.userNotificationId"
                   :class="['p-4 border-b border-gray-200', {'bg-gray-100': !notification.read}]">
                <div class="flex flex-col">
                  <div class="flex justify-between items-start mb-2">
                    <span :class="{'font-semibold': !notification.read}" class="mr-2">
                      <router-link :to="`/${notification.orgName}/${notification.repositoryName}/issues`" class="text-blue-600 hover:underline">
                        {{ notification.repositoryName }}
                      </router-link>
                      에 새로운 이슈가 추가되었어요!
                    </span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-xs text-gray-500">{{ notification.formattedTime }}</span>
                    <button v-if="!notification.read" @click="markAsRead(notification.userNotificationId)"
                            class="text-xs text-blue-600 hover:text-blue-800">
                      읽음
                    </button>
                  </div>
                </div>
              </div>
              <div v-if="notifications.length > visibleNotifications.length" class="p-2 text-center">
                <button @click.stop="loadMoreNotifications" class="text-blue-600 hover:underline">더 보기</button>
              </div>
            </div>
            <div v-else class="p-4 text-gray-500">
              알림이 없습니다.
            </div>
            <div class="p-2 border-t border-gray-200">
              <button @click="markAllAsRead" class="w-full text-center text-blue-600 hover:underline">모두 읽음</button>
            </div>
          </div>
        </div>
        <router-link class="text-sm font-semibold leading-6 text-gray-900" to="/">Home</router-link>
        <router-link class="text-sm font-semibold leading-6 text-gray-900" to="/repositories">Repositories</router-link>
      </div>
      <div v-if="isLoggedIn" class="mx-5"></div>
      <div v-if="isLoggedIn" class="flex items-center gap-x-4">
        <div class="flex items-center space-x-2">
          <img :src="avatarURL" class="w-10 h-10 rounded-full" alt="User Avatar">
          <router-link to="/settings" class="text-sm font-semibold leading-6 text-blue-600 hover:underline">
            {{ userName }}
          </router-link>
        </div>
        <router-link class="text-sm font-semibold leading-6 text-gray-900" to="/logout">Logout</router-link>
      </div>
      <div v-else class="flex justify-end flex-1">
        <router-link class="text-sm font-semibold leading-6 text-gray-900" to="/login">Login</router-link>
      </div>
    </nav>
  </header>
  <router-view></router-view>
</template>

<script>
import {computed, onMounted, onUnmounted, ref, watch} from 'vue';
import {useRoute} from 'vue-router';
import {useAuthStore} from '@/store/pinia';
import {fetchEventSource} from '@microsoft/fetch-event-source';
import axios from 'axios';

export default {
  setup() {
    const authStore = useAuthStore();
    const route = useRoute();
    const isLoggedIn = computed(() => authStore.isLoggedIn);
    const userName = computed(() => authStore.userName);
    const avatarURL = computed(() => authStore.avatarURL);

    const notifications = ref([]);
    const visibleNotifications = ref([]);
    const unreadCount = ref(0);
    const showNotifications = ref(false);
    const isConnected = ref(false);
    const notificationsPerPage = 5;
    const currentPage = ref(1);

    let reconnectInterval;

    const formatTime = (isoString) => {
      if (!isoString) return '';

      const [datePart, timePart] = isoString.split('T');
      const timeWithoutSeconds = timePart.split(':').slice(0, 2).join(':');

      return `${datePart} ${timeWithoutSeconds}`;
    };

    const loadMoreNotifications = () => {
      currentPage.value++;
      updateVisibleNotifications();
    };

    const updateVisibleNotifications = () => {
      visibleNotifications.value = notifications.value.slice(0, currentPage.value * notificationsPerPage);
    };

    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_URL}/notifications`, {
          headers: {
            'Authorization': `Bearer ${authStore.accessToken}`
          }
        });
        notifications.value = response.data
            .map(notification => ({
              ...notification,
              formattedTime: formatTime(notification.localDateTime)
            }))
            .sort((a, b) => new Date(b.localDateTime) - new Date(a.localDateTime));
        updateVisibleNotifications();
        unreadCount.value = notifications.value.filter(n => !n.read).length;
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    const toggleNotifications = async () => {
      showNotifications.value = !showNotifications.value;
      if (showNotifications.value) {
        await fetchNotifications();
      } else {
        // Reset to show only the first 5 notifications when closing
        currentPage.value = 1;
        updateVisibleNotifications();
      }
    };

    const closeNotifications = () => {
      showNotifications.value = false;
      // Reset to show only the first 5 notifications when closing
      currentPage.value = 1;
      updateVisibleNotifications();
    };

    const markAsRead = async (userNotificationId) => {
      try {
        await axios.patch(`${process.env.VUE_APP_API_URL}/notifications/${userNotificationId}`,
          { read: true },
          {
            headers: {
              'Authorization': `Bearer ${authStore.accessToken}`
            }
          }
        );
        const notification = notifications.value.find(n => n.userNotificationId === userNotificationId);
        if (notification) {
          notification.read = true;
          unreadCount.value = Math.max(0, unreadCount.value - 1);
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    };

    const markAllAsRead = async () => {
      try {
        await axios.post(`${process.env.VUE_APP_API_URL}/notifications/read-all`, null, {
          headers: {
            'Authorization': `Bearer ${authStore.accessToken}`
          }
        });
        notifications.value.forEach(notification => {
          notification.read = true;
        });
        unreadCount.value = 0;
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
      }
    };

    const connectSSE = async () => {
      if (!isLoggedIn.value || route.meta.hideHeader || isConnected.value) return;

      const accessToken = authStore.accessToken;

      try {
        await fetchEventSource(`${process.env.VUE_APP_API_URL}/connect`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          onopen(response) {
            if (response.ok && response.headers.get('content-type') === 'text/event-stream') {
              console.log('SSE connection opened.');
              isConnected.value = true;
            } else {
              console.error('SSE connection failed.', response);
              isConnected.value = false;
            }
          },
          onmessage(event) {
            try {
              const data = JSON.parse(event.data);
              if (data.unreadCount !== undefined) {
                unreadCount.value = data.unreadCount;
              }
              if (data.userNotificationId) {
                const newNotification = {
                  ...data,
                  formattedTime: formatTime(data.localDateTime)
                };
                notifications.value = [newNotification, ...notifications.value]
                    .sort((a, b) => new Date(b.localDateTime) - new Date(a.localDateTime));
                updateVisibleNotifications();
                unreadCount.value++;
              }
            } catch (error) {
              console.error('Error parsing SSE message:', error);
            }
          },
          onclose() {
            console.log('SSE connection closed.');
            isConnected.value = false;
          },
          onerror(err) {
            console.error('SSE connection error:', err);
            isConnected.value = false;
          },
        });
      } catch (err) {
        console.error('SSE connection error:', err);
        isConnected.value = false;
      }
    };

    onMounted(() => {
      if (!route.meta.hideHeader) {
        connectSSE();
        reconnectInterval = setInterval(() => {
          if (!isConnected.value) {
            connectSSE();
          }
        }, 61000);
      }
    });

    onUnmounted(() => {
      if (reconnectInterval) {
        clearInterval(reconnectInterval);
      }
    });

    watch(() => route.meta.hideHeader, (newVal) => {
      if (!newVal && !isConnected.value) {
        connectSSE();
      }
    });

    return {
      isLoggedIn,
      userName,
      avatarURL,
      notifications,
      visibleNotifications,
      unreadCount,
      showNotifications,
      toggleNotifications,
      closeNotifications,
      loadMoreNotifications,
      markAsRead,
      markAllAsRead
    };
  }
};
</script>