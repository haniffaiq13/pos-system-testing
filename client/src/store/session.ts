// Session store - manages current user session and role switching

import { create } from 'zustand';
import * as persistUtil from '@/utils/persist';
import type { User } from '@shared/schema';

interface SessionStore {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
  isRole: (role: string) => boolean;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  currentUser: persistUtil.retrieve<User>('currentUser'),
  
  setCurrentUser: (user) => {
    set({ currentUser: user });
    if (user) {
      persistUtil.persist('currentUser', user);
    } else {
      persistUtil.remove('currentUser');
    }
  },

  logout: () => {
    set({ currentUser: null });
    persistUtil.remove('currentUser');
  },

  isRole: (role) => {
    const { currentUser } = get();
    return currentUser?.role === role;
  },
}));
