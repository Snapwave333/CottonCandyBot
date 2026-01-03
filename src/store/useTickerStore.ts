import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface TickerItem {
  symbol: string;
  price: string;
  change24h: number;
  id: string;
  image: string;
}

interface TickerState {
  tickerData: TickerItem[];
  selectedItem: TickerItem | null;
  actions: {
    setTickerData: (data: TickerItem[]) => void;
    setSelectedItem: (item: TickerItem | null) => void;
  };
}

export const useTickerStore = create<TickerState>()(
  subscribeWithSelector((set) => ({
    tickerData: [],
    selectedItem: null,
    actions: {
      setTickerData: (data) => set({ tickerData: data }),
      setSelectedItem: (item) => set({ selectedItem: item }),
    },
  }))
);
