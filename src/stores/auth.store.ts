import { create } from "zustand";
import { Session, Subscription } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface AuthState {
  session: Session | null;
  loading: boolean;
  subscription: Subscription | null;
  setSession: (session: Session | null) => void;
  clearSession: () => void;
  initialize: () => Promise<void>;
  cleanup: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  loading: true,
  subscription: null,
  setSession: (session) => set({ session }),
  clearSession: () => set({ session: null }),
  cleanup: () => {
    get().subscription?.unsubscribe();
    set({ subscription: null });
  },
  initialize: async () => {
    get().subscription?.unsubscribe();
    const { data } = await supabase.auth.getSession();
    set({ session: data.session, loading: false });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, loading: false });
    });
    set({ subscription });
  },
}));
