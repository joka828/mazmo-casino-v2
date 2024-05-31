import { create } from "zustand";

export const useMenuState = create<{
  socketStatus: boolean;
  loading: boolean;
  setSocketStatus: (status: boolean) => void;
  setLoading: (status: boolean) => void;
}>((set) => {
  return {
    socketStatus: false,
    setSocketStatus: (status: boolean) => set({ socketStatus: status }),
    loading: true,
    setLoading: (status: boolean) => set({ loading: status }),
  };
});
