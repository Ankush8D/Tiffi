import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const useAuthStore = create((set) => ({
  user: null,
  role: null,
  isLoading: true,

  setAuth: async (data) => {
    await SecureStore.setItemAsync('access_token', data.accessToken);
    await SecureStore.setItemAsync('refresh_token', data.refreshToken);
    set({ user: data, role: data.role, isLoading: false });
  },

  clearAuth: async () => {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    set({ user: null, role: null, isLoading: false });
  },

  setLoading: (isLoading) => set({ isLoading }),
}));

export default useAuthStore;
