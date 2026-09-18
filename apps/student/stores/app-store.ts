import { create } from "zustand";
import type { AppRole } from "@edupathai/auth";

interface AppState {
  role: AppRole;
  setRole: (role: AppRole) => void;
}

export const useAppStore = create<AppState>((set) => ({
  role: "student",
  setRole: (role) => set({ role }),
}));