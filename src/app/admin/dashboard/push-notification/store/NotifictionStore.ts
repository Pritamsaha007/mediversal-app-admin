import { create } from "zustand";
import { Notification } from "../types/types";

interface NotificationStore {
  notifications: Notification[];

  setNotifications: (notifications: Notification[]) => void;
}

const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],

  setNotifications: (notifications) => set({ notifications }),
}));

export default useNotificationStore;
