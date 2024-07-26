<template>
  <div class="container mx-auto mt-6 max-w-7xl font-sans">
    <div class="text-black py-4 px-6 flex justify-between items-center font-bold">
      <h1 class="text-lg text-left font-bold">설정</h1>
    </div>

    <div class="setting-section bg-white border-b border-gray-200 py-4 px-6">
      <h2 class="text-base font-semibold mb-4">알림 설정</h2>
      <div class="flex items-center justify-between">
        <span class="text-base">이메일 알림 받기</span>
        <label class="switch">
          <input type="checkbox" v-model="userAlertStatus" @change="updateAlertStatus">
          <span class="slider round"></span>
        </label>
      </div>
      <div class="mt-4 flex items-center">
        <input
            type="email"
            v-model="editedEmail"
            class="flex-grow p-2 border rounded"
            :placeholder="userEmail ? '' : '등록된 이메일이 없습니다.'"
        >
        <button
            @click="updateEmail"
            class="ml-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded text-sm"
            v-if="isEmailChanged"
        >
          수정
        </button>
      </div>
    </div>

    <div class="setting-section bg-white border-b border-gray-200 py-4 px-6">
      <h2 class="text-base font-semibold mb-4">계정 관리</h2>
      <button
          class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded text-sm"
          @click="showDeleteConfirmation = true"
      >
        계정 삭제
      </button>
    </div>

    <div v-if="showDeleteConfirmation"
         class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div class="bg-white p-5 rounded-lg shadow-xl">
        <h3 class="text-lg font-bold mb-4">정말로 삭제하시겠습니까?</h3>
        <p class="mb-4">모든 사용자 정보와 인증 정보가 삭제됩니다.</p>
        <div class="flex justify-end space-x-2">
          <button
              class="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
              @click="showDeleteConfirmation = false"
          >
            취소
          </button>
          <button
              class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
              @click="deleteAccount"
          >
            탈퇴 확인
          </button>
        </div>
      </div>
    </div>

    <!-- 계정 삭제 성공 모달 -->
    <div v-if="showDeleteSuccessModal"
         class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div class="bg-white p-5 rounded-lg shadow-xl">
        <h3 class="text-lg font-bold mb-4">계정이 성공적으로 삭제되었습니다.</h3>
        <div class="flex justify-end">
          <button
              class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              @click="goToMainPage"
          >
            확인
          </button>
        </div>
      </div>
    </div>

    <Notification :message="notificationMessage" :show="showNotification" :type="notificationType"/>
  </div>
</template>

<script>
import {computed, defineComponent, onMounted, ref} from 'vue';
import {useAuthStore} from '@/store/pinia';
import axios from 'axios';
import Notification from '@/components/RepositoryNotificationPage.vue';
import {useRouter} from "vue-router";

export default defineComponent({
  name: 'SettingsPage',
  components: {
    Notification
  },
  setup() {
    const authStore = useAuthStore();
    const showDeleteConfirmation = ref(false);
    const showDeleteSuccessModal = ref(false);
    const showNotification = ref(false);
    const notificationType = ref('success');
    const notificationMessage = ref('');
    const userEmail = ref('');
    const editedEmail = ref('');
    const userAlertStatus = ref(false);
    const router = useRouter();

    const isEmailChanged = computed(() => {
      return editedEmail.value !== userEmail.value;
    });

    const showNotificationMessage = (type, message) => {
      notificationType.value = type;
      notificationMessage.value = message;
      showNotification.value = true;
      setTimeout(() => {
        showNotification.value = false;
      }, 3000);
    };

    const fetchUserInfo = async () => {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_URL}/user/info`, {
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`
          }
        });
        const userData = response.data;
        userEmail.value = userData.email;
        editedEmail.value = userData.email;
        userAlertStatus.value = userData.alertStatus;
      } catch (error) {
        console.error('Error fetching user info:', error);
        showNotificationMessage('error', '사용자 정보를 가져오는 중 오류가 발생했습니다.');
      }
    };

    const updateEmail = async () => {
      try {
        await axios.patch(`${process.env.VUE_APP_API_URL}/user/email`,
            {email: editedEmail.value},
            {
              headers: {
                Authorization: `Bearer ${authStore.accessToken}`
              }
            }
        );
        await fetchUserInfo();
        showNotificationMessage('success', '이메일이 성공적으로 수정되었습니다.');
      } catch (error) {
        console.error('Error updating email:', error);
        showNotificationMessage('error', '이메일 수정 중 오류가 발생했습니다.');
      }
    };

    const updateAlertStatus = async () => {
      try {
        await axios.patch(`${process.env.VUE_APP_API_URL}/user/alert`,
            {alertStatus: userAlertStatus.value},
            {
              headers: {
                Authorization: `Bearer ${authStore.accessToken}`
              }
            }
        );
        await fetchUserInfo();
        showNotificationMessage('success', '알림 설정이 업데이트되었습니다.');
      } catch (error) {
        console.error('Error updating alert status:', error);
        showNotificationMessage('error', '알림 설정 업데이트 중 오류가 발생했습니다.');
        userAlertStatus.value = !userAlertStatus.value;
      }
    };

    const deleteAccount = async () => {
      try {
        await axios.delete(`${process.env.VUE_APP_API_URL}/user/withdraw`, {
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`
          }
        });
        await authStore.clearCredentials();
        showDeleteConfirmation.value = false;
        showDeleteSuccessModal.value = true;
      } catch (error) {
        console.error('Error deleting account:', error);
        showNotificationMessage('error', '계정 삭제 중 오류가 발생했습니다.');
        showDeleteConfirmation.value = false;
      }
    };

    const goToMainPage = () => {
      showDeleteSuccessModal.value = false;
      router.push('/');
    };

    onMounted(fetchUserInfo);

    return {
      showDeleteConfirmation,
      showDeleteSuccessModal,
      showNotification,
      notificationType,
      notificationMessage,
      deleteAccount,
      showNotificationMessage,
      userEmail,
      editedEmail,
      isEmailChanged,
      updateEmail,
      userAlertStatus,
      updateAlertStatus,
      goToMainPage
    };
  }
});
</script>

<style scoped>
.setting-section {
  transition: background-color 0.3s;
}

.setting-section:hover {
  background-color: #f3f4f6;
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>