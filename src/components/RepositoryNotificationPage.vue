<template>
  <div v-if="show" class="notification" :class="type">
    <div class="notification-content">
      <svg v-if="type === 'success'" xmlns="http://www.w3.org/2000/svg" height="14" width="12.25" viewBox="0 0 448 512" class="icon">
        <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/>
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon">
        <path fill="#63E6BE" d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/>
      </svg>
      <span>{{ message }}</span>
    </div>
  </div>
</template>
<script>
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    type: {
      type: String,
      default: 'success'
    },
    message: {
      type: String,
      default: ''
    },
    show: {
      type: Boolean,
      default: false
    }
  }
});
</script>

<style scoped>
.notification {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  padding: 16px;
  border-radius: 4px;
  color: white;
  font-weight: bold;
  z-index: 9999;
  display: flex;
  align-items: center;
}

.success {
  background-color: #48bb78;
}

.error {
  background-color: #f56565;
}

.notification-content {
  display: flex;
  align-items: center;
}

.notification-content i {
  margin-right: 8px;
  font-size: 20px;
}
</style>