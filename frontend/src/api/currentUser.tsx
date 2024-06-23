import { create } from "zustand";

export const authFetch = async (path: string, options?: RequestInit) => {
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get("token");
  const fetchOptions = options ?? {};

  if (token) {
    fetchOptions.headers = {
      ...fetchOptions.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  return fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, fetchOptions);
};

export const useCurrentUserState = create<{
  userId?: string;
  channelId?: string;
  role?: string;
  error: boolean;
  status: "active" | "maintenance" | string;
  fetchUserData: () => void;
  setCasinoStatus: (status: string) => void;
  postMaintenanceStatus: (maintenance: boolean) => void;
}>((set) => {
  return {
    userId: undefined,
    error: false,
    status: "active",
    fetchUserData: async () => {
      try {
        const response = await authFetch("/casino-auth");

        if (!response) return set({ error: true });

        const { userId, channelId, role, status } =
          (await response.json()) as Record<string, string>;

        return set({
          userId,
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
