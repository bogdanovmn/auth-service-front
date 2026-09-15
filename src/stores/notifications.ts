import { defineStore } from 'pinia';
import { ref } from 'vue';
import { t } from '../i18n';

export const notificationStore = defineStore('notificationStore', () => {
  const errorKey = ref<string | null>(null);

  function setError(key: string) {
    errorKey.value = key;
  }

  function clearError() {
    errorKey.value = null;
  }

  function getError() {
    return t(errorKey.value ?? 'errors.default');
  }

  return {
    setError, clearError, getError
  };
});