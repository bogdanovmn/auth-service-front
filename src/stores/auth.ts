import { defineStore } from 'pinia';
import { ref } from 'vue';
import { tokenStorage, TokenClaims } from '@bogdanovmn/ssofw';

// The access token also carries a "userId" claim, which the library's claims
// type doesn't declare.
type AppTokenClaims = TokenClaims & { userId?: string };

export const authStore = defineStore('authStore', () => {
  const isAuthenticated = ref(false);
  const userId = ref<string | null>(null);
  // the account display name
  const userName = ref<string | null>(null);
  const isAdmin = ref<boolean>(false);
  const redirectToAfterSuccessLogin = ref<string | null>(null);
  const codeToExchange = ref<string | null>(null)

  function update() {
    isAuthenticated.value = tokenStorage.defined();
    const claims = tokenStorage.claims as AppTokenClaims | undefined;
    userId.value = claims?.userId ?? null;
    userName.value = claims?.userName ?? null;
    isAdmin.value = userName.value != null
      ? claims!.isSuperAdmin()
      : false
  }

  return {
    isAuthenticated,
    isAdmin,
    userId,
    userName,
    update,
    redirectToAfterSuccessLogin,
    codeToExchange
  };
});
