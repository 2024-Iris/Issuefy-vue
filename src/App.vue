<template>
  <header v-if="!$route.meta.hideHeader" class="bg-white">
    <nav aria-label="Global" class="flex w-full items-center justify-between py-4 px-4 bg-gray-50 flex-wrap">
      <div class="flex items-center flex-grow">
        <router-link class="flex items-center" to="/">
          <img alt="issuefy logo" class="h-16 w-auto" src="./assets/issuefy-removebg_logo.png"/>
        </router-link>
        <div v-if="$route.meta.showBreadcrumbs" class="ml-4 flex items-center space-x-2">
          <span class="text-sm font-medium text-gray-900">{{ $route.params.org }}</span>
          <span class="text-sm font-medium text-gray-500">/</span>
          <router-link
              :to="`/${$route.params.org}/${$route.params.repository}/issues`"
              class="text-sm font-medium text-gray-900 hover:text-blue-600"
          >
            {{ $route.params.repository }}
          </router-link>
        </div>
      </div>
      <div v-if="isLoggedIn" class="flex items-center gap-x-2 flex-wrap">
        <div class="relative mr-2">
          <button class="relative" @click="toggleNotifications">
            <font-awesome-icon icon="bell" style="color: #B197FC; font-size: 1.25rem;"/>
            <span
                v-if="unreadCount > 0"
                class="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1"
            >
              {{ unreadCount }}
            </span>
          </button>
          <div
              v-if="showNotifications"
              v-click-outside="closeNotifications"
              class="absolute right-0 mt-2 w-80 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto"
          >
            <div v-if="visibleNotifications.length > 0">
              <div
                  v-for="notification in visibleNotifications"
                  :key="notification.userNotificationId"
                  :class="['p-3 border-b border-gray-200', {'bg-gray-50': !notification.read}]"
              >
                <div class="flex flex-col">
                  <div class="flex justify-between items-start mb-2">
                    <span :class="{'font-semibold': !notification.read}" class="mr-2">
                      <span>새로운 이슈가 추가되었어요!</span>
                      <router-link
                          :to="`/${notification.orgName}/${notification.repositoryName}/issues`"
                          class="text-purple-500 hover:text-purple-700"
                      >
                        <div>
                          {{ notification.orgName + ' / ' + notification.repositoryName }}
                        </div>
                      </router-link>
                    </span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-xs text-gray-500">{{ notification.formattedTime }}</span>
                    <button
                        v-if="!notification.read"
                        class="text-xs text-purple-500 hover:text-purple-700"
                        @click="markAsRead(notification.userNotificationId)"
                    >
                      읽음
                    </button>
                  </div>
                </div>
              </div>
              <div v-if="notifications.length > visibleNotifications.length" class="p-2 text-center">
                <button class="text-purple-500 hover:text-purple-700" @click.stop="loadMoreNotifications">
                  더 보기
                </button>
              </div>
            </div>
            <div v-else class="p-4 text-gray-500">
              알림이 없습니다.
            </div>
            <div v-if="hasUnreadNotifications" class="p-2 border-t border-gray-200">
              <button class="w-full text-center text-purple-500 hover:text-purple-700" @click="markAllAsRead">
                모두 읽음
              </button>
            </div>
          </div>
        </div>
        <router-link class="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-600 p-2" to="/">
          Home
        </router-link>
        <router-link class="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-600 p-2" to="/repositories">
          Repositories
        </router-link>
      </div>
      <div v-if="isLoggedIn" class="flex items-center gap-x-2 flex-wrap ml-4">
        <div class="flex items-center space-x-2">
          <img :src="avatarURL" alt="User Avatar" class="w-10 h-10 rounded-full">
          <router-link class="text-sm font-semibold leading-6 text-blue-600 hover:underline" to="/settings">
            {{ userName }}
          </router-link>
        </div>
        <router-link class="text-sm font-semibold leading-6 text-gray-900" to="/logout">Logout</router-link>
      </div>
      <div v-else class="flex justify-end">
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
    const notificationsPerPage = 3;
    const currentPage = ref(1);

    const hasUnreadNotifications = computed(() => {
      return notifications.value.some(n => !n.read);
    });

    let reconnectInterval;

    const formatTime = (isoString) => {
      if (!isoString) return '';

      const date = new Date(isoString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return `${year}-${month}-${day} ${hours}:${minutes}`;
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
              formattedTime: formatTime(notification.notificationCreatedAt)
            }))
            .sort((a, b) => new Date(b.notificationCreatedAt) - new Date(a.notificationCreatedAt));
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
        currentPage.value = 1;
        updateVisibleNotifications();
      }
    };

    const closeNotifications = () => {
      showNotifications.value = false;
      currentPage.value = 1;
      updateVisibleNotifications();
    };

    const markNotificationsAsRead = async (userNotificationIds) => {
      try {
        const response = await axios.patch(
            `${process.env.VUE_APP_API_URL}/notifications`,
            {userNotificationIds},
            {
              headers: {
                'Authorization': `Bearer ${authStore.accessToken}`
              }
            }
        );

        if (response.status === 200) {
          userNotificationIds.forEach(id => {
            const notification = notifications.value.find(n => n.userNotificationId === id);
            if (notification) {
              notification.read = true;
            }
          });
          unreadCount.value = notifications.value.filter(n => !n.read).length;
        }
      } catch (error) {
        console.error('Error marking notifications as read:', error);
      }
    };

    const markAsRead = async (userNotificationId) => {
      await markNotificationsAsRead([userNotificationId]);
    };

    const markAllAsRead = async () => {
      const unreadNotificationIds = notifications.value
          .filter(n => !n.read)
          .map(n => n.userNotificationId);
      if (unreadNotificationIds.length > 0) {
        await markNotificationsAsRead(unreadNotificationIds);
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
                  formattedTime: formatTime(data.notificationCreatedAt)
                };
                notifications.value = [newNotification, ...notifications.value]
                    .sort((a, b) => new Date(b.notificationCreatedAt) - new Date(a.notificationCreatedAt));
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
      hasUnreadNotifications,
      toggleNotifications,
      closeNotifications,
      loadMoreNotifications,
      markAsRead,
      markAllAsRead
    };
  }
};
</script>