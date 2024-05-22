<template>
  <div v-if="show" class="notification" :class="type">
    <div class="notification-content">
      <font-awesome-icon v-if="type === 'success'" icon="check" style="color: #63E6BE;"/>
      <font-awesome-icon v-else icon="circle-exclamation"/>
      <span>{{ message }}</span>
    </div>
  </div>
</template>
<script>
import {defineComponent} from 'vue';

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
  top: 90px;
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
  background-color: #ff5566;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.notification-content i {
  margin-right: 8px;
  font-size: 20px;
}
</style>