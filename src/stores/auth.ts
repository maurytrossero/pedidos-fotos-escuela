// src/stores/auth.ts
import { ref } from 'vue';

export const isAuthenticated = ref(localStorage.getItem('token') !== null);

export function login(token: string) {
  localStorage.setItem('token', token);
  isAuthenticated.value = true;
}

export function logout() {
  localStorage.removeItem('token');
  isAuthenticated.value = false;
}
