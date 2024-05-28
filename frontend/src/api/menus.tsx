import { create } from "zustand";

export const useMenuState = create<{
  socketStatus: boolean;
  setSocketStatus: (status: boolean) => void;
}>((set) => {
  return {
    socketStatus: false,
    setSocketStatus: (status: boolean) => set({ socketStatus: status }),
  };
});
