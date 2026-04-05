import { create } from 'zustand';

const useDeliveryStore = create((set, get) => ({
  todayList: [],
  offlineQueue: [],
  isOffline: false,

  setTodayList: (list) => set({ todayList: list }),

  updateDeliveryStatus: (customerId, mealType, status) => {
    set((state) => ({
      todayList: state.todayList.map((item) =>
        item.customerId === customerId && item.mealType === mealType
          ? { ...item, status }
          : item
      ),
    }));
  },

  addToOfflineQueue: (mark) => {
    set((state) => ({
      offlineQueue: [...state.offlineQueue, { ...mark, queuedAt: new Date().toISOString() }],
    }));
  },

  clearOfflineQueue: () => set({ offlineQueue: [] }),

  setOffline: (isOffline) => set({ isOffline }),
}));

export default useDeliveryStore;
