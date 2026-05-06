import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface UiState {
  isDark: boolean;
  toggleDark: () => void;
  setDark: (value: boolean) => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  isDark: false,
  toggleDark: () => {
    const next = !get().isDark;
    set({ isDark: next });
    AsyncStorage.setItem("theme", next ? "dark" : "light");
  },
  setDark: (value) => set({ isDark: value }),
}));
