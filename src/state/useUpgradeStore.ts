import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UpgradeItem } from "@/domain/types";

interface UpgradeState {
  items: UpgradeItem[];
  addItem: (text: string) => boolean;
  toggleItem: (id: string) => void;
  deleteItem: (id: string) => void;
  hydrateItems: (items: UpgradeItem[]) => void;
}

export const useUpgradeStore = create<UpgradeState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (text) => {
        const clean = text.trim().replace(/\s+/g, " ");
        if (!clean) return false;
        const item: UpgradeItem = {
          id: crypto.randomUUID(),
          text: clean,
          completed: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ items: [item, ...state.items] }));
        return true;
      },
      toggleItem: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, completed: !item.completed } : item,
          ),
        })),
      deleteItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      hydrateItems: (items) => set({ items }),
    }),
    { name: "macht_upgrades" },
  ),
);
