
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Trade, WeekSummary } from '../types/trade';
import { startOfWeek, endOfWeek, format, getWeek } from 'date-fns';

interface TradeState {
  trades: Trade[];
  selectedDate: Date;
  addTrade: (trade: Omit<Trade, 'id'>) => void;
  updateTrade: (id: string, trade: Partial<Trade>) => void;
  deleteTrade: (id: string) => void;
  setSelectedDate: (date: Date) => void;
  getTradesByDate: (date: Date) => Trade[];
  getTradesByDateRange: (start: Date, end: Date) => Trade[];
  getWeeklySummaries: (month: Date) => WeekSummary[];
  getMonthlyProfit: (month: Date) => number;
}

export const useTradeStore = create<TradeState>()(
  persist(
    (set, get) => ({
      trades: [],
      selectedDate: new Date(),
      
      addTrade: (trade) => set((state) => {
        const newTrade: Trade = {
          ...trade,
          id: crypto.randomUUID(),
          // Use the manually entered profit value directly
          profit: trade.profit !== undefined ? trade.profit : 0,
        };
        return { trades: [...state.trades, newTrade] };
      }),
      
      updateTrade: (id, updatedTrade) => set((state) => {
        const tradeIndex = state.trades.findIndex(trade => trade.id === id);
        if (tradeIndex === -1) return state;
        
        const oldTrade = state.trades[tradeIndex];
        const newTrade = { ...oldTrade, ...updatedTrade };
        
        // If profit was manually updated, use that value directly
        if (updatedTrade.profit !== undefined) {
          newTrade.profit = updatedTrade.profit;
        }
        
        const updatedTrades = [...state.trades];
        updatedTrades[tradeIndex] = newTrade;
        
        return { trades: updatedTrades };
      }),
      
      deleteTrade: (id) => set((state) => ({
        trades: state.trades.filter(trade => trade.id !== id)
      })),
      
      setSelectedDate: (date) => set({ selectedDate: date }),
      
      getTradesByDate: (date) => {
        const { trades } = get();
        const dateStr = format(date, 'yyyy-MM-dd');
        
        return trades.filter(trade => format(new Date(trade.date), 'yyyy-MM-dd') === dateStr);
      },
      
      getTradesByDateRange: (start, end) => {
        const { trades } = get();
        const startTime = start.getTime();
        const endTime = end.getTime();
        
        return trades.filter(trade => {
          const tradeTime = new Date(trade.date).getTime();
          return tradeTime >= startTime && tradeTime <= endTime;
        });
      },
      
      getWeeklySummaries: (month) => {
        const { getTradesByDateRange } = get();
        const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
        const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);
        
        // Create an object to store weekly data
        const weeklyData: Record<number, WeekSummary> = {};
        
        // Initialize each week in the month
        for (let day = 1; day <= endDate.getDate(); day++) {
          const currentDate = new Date(month.getFullYear(), month.getMonth(), day);
          const weekNum = getWeek(currentDate);
          
          if (!weeklyData[weekNum]) {
            weeklyData[weekNum] = {
              weekNumber: weekNum,
              totalProfit: 0,
              tradeCount: 0
            };
          }
        }
        
        // Group trades by week
        const monthlyTrades = getTradesByDateRange(startDate, endDate);
        monthlyTrades.forEach(trade => {
          const tradeDate = new Date(trade.date);
          const weekNum = getWeek(tradeDate);
          
          if (weeklyData[weekNum]) {
            weeklyData[weekNum].totalProfit += trade.profit;
            weeklyData[weekNum].tradeCount += 1;
          }
        });
        
        return Object.values(weeklyData);
      },
      
      getMonthlyProfit: (month) => {
        const { getTradesByDateRange } = get();
        const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
        const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);
        
        const monthlyTrades = getTradesByDateRange(startDate, endDate);
        return monthlyTrades.reduce((total, trade) => total + trade.profit, 0);
      }
    }),
    {
      name: 'trading-journal-storage',
    }
  )
);
