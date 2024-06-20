import { create } from "zustand";
import { authFetch } from "../currentUser";

export const useManagement = create<{
  balance?: number;
  fetchBalance: () => void;
}>((set) => {
  return {
    balance: undefined,
    fetchBalance: async () => {
      try {
        const response = await authFetch("/casino-auth");
        const { balance } = (await response.json()) as Record<string, number>;

        return set({
          balance,
        });
      } catch (e) {
        console.error(e);
      }
    },
  };
});
