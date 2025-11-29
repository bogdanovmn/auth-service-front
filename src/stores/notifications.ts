import { defineStore } from 'pinia';
import { ref } from 'vue';

export const notificationStore = defineStore('notificationStore', () => {
  const errorMsg = ref<string|null>(null);

  function setError(msg: string) {
    errorMsg.value = msg;
  }

  function clearError() {
    errorMsg.value = null;
  }

  function getError() {
    return errorMsg.value || 'An unexpected error occurred';
  }

  return {
    setError, clearError, getError
  };
});