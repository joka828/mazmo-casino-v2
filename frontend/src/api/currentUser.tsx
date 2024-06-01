import { create } from "zustand";
import { decodeToken } from "react-jwt";

export const useCurrentUserState = create<{
  userId?: string;
  channelId?: string;
  role?: string;
  error: boolean;
  setUserData: (status: string) => void;
}>((set) => {
  return {
    userId: undefined,
    error: false,
    setUserData: (jwt: string) => {
      const decodedToken = decodeToken<{
        userId: string;
        channelId: string;
        role: string;
      }>(jwt);

      console.log("decodedToken", decodedToken);
      if (!decodedToken) return set({ error: true });

      const { userId, channelId, role } = decodedToken;

      return set({
        userId,
        channelId,
        role,
        error: !userId,
      });
    },
  };
});
