import { create } from "zustand";

export const useCurrentUserState = create<{
  userToken?: string;
  userId?: number;
  channelId?: string;
  role?: string;
  error: boolean;
  status: "active" | "maintenance" | string;
  authFetch: (path: string, options?: RequestInit) => Promise<Response>;
  setUserToken: (userToken?: string) => void;
  fetchUserData: () => void;
  setCasinoStatus: (status: string) => void;
  postMaintenanceStatus: (maintenance: boolean) => void;
}>((set, get) => {
  const authFetch = async (path: string, options?: RequestInit) => {
    const fetchOptions = options ?? {};
    const userToken = get().userToken;

    if (userToken) {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        Authorization: `Bearer ${userToken}`,
      };
    }

    return fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, fetchOptions);
  };

  return {
    userToken: undefined,
    userId: undefined,
    error: false,
    status: "active",
    authFetch,
    setUserToken: (userToken?: string) => {
      if (userToken) {
        set({ userToken });
      } else {
        set({ error: true });
      }
    },
    fetchUserData: async () => {
      try {
        if (!get().userToken) return set({ error: true });

        const response = await authFetch("/casino-auth");

        if (!response) return set({ error: true });

        const { userId, channelId, role, status } =
          (await response.json()) as Record<string, string>;

        return set({
          userId: Number(userId),
          channelId,
          role,
          error: !userId,
          status,
        });
      } catch (e) {
        console.error(e);
        set({ error: true });
      }
    },
    setCasinoStatus: async (status: string) => {
      set({ status });
    },
    postMaintenanceStatus: async (maintenance: boolean) => {
      await authFetch("/management/maintenance", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ maintenance }),
      });
    },
  };
});
