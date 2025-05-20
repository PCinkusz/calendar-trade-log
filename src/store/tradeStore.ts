
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Trade } from '@/types/trade';
import { startOfWeek, endOfWeek, isWithinInterval, startOfMonth, endOfMonth, getWeek, isSameDay } from 'date-fns';

interface TradeState {
  trades: Trade[];
  selectedDate: Date;
  addTrade: (trade: Omit<Trade, 'id'>) => void;
  updateTrade: (id: string, trade: Partial<Trade>) => void;
  deleteTrade: (id: string) => void;
  setSelectedDate: (date: Date) => void;
  getTradesByDate: (date: Date) => Trade[];
  getTrade: (id: string) => Trade | undefined;
  getWeeklySummaries: (monthDate: Date) => Array<{
    weekNumber: number;
    startDate: Date;
    endDate: Date;
    totalProfit: number;
    tradeCount: number;
  }>;
  getMonthlyProfit: (monthDate: Date) => number;
}

export const useTradeStore = create<TradeState>()(
  persist(
    (set, get) => ({
      trades: [
        {
          id: uuidv4(),
          symbol: 'AAPL',
          type: 'buy',
          entryPrice: 150.25,
          exitPrice: 158.75,
          quantity: 10,
          profit: 85,
          openDate: new Date('2025-05-14T14:30:00'),
          closeDate: new Date('2025-05-14T15:45:00'),
          date: new Date('2025-05-14T15:45:00'),
          notes: 'Good momentum trade on earnings beat'
        },
        {
          id: uuidv4(),
          symbol: 'MSFT',
          type: 'sell',
          entryPrice: 325.50,
          exitPrice: 320.25,
          quantity: 5,
          profit: 26.25,
          openDate: new Date('2025-05-13T10:15:00'),
          closeDate: new Date('2025-05-13T11:30:00'),
          date: new Date('2025-05-13T11:30:00'),
          notes: 'Quick scalp on market open'
        },
      ],
      selectedDate: new Date(),
      
      addTrade: (trade) => set(state => ({
        trades: [...state.trades, { ...trade, id: uuidv4() }]
      })),
      
      updateTrade: (id, updatedTrade) => set(state => ({
        trades: state.trades.map(trade => 
          trade.id === id ? { ...trade, ...updatedTrade } : trade
        )
      })),
      
      deleteTrade: (id) => set(state => ({
        trades: state.trades.filter(trade => trade.id !== id)
      })),
      
      setSelectedDate: (date) => set({ 
        selectedDate: date instanceof Date ? date : new Date() 
      }),
      
      getTradesByDate: (date) => {
        const { trades } = get();
        return trades.filter(trade => {
          const closeDate = new Date(trade.closeDate);
          return isSameDay(closeDate, date);
        });
      },
      
      getTrade: (id) => {
        const { trades } = get();
        return trades.find(trade => trade.id === id);
      },
      
      getWeeklySummaries: (monthDate) => {
        const { trades } = get();
        
        // Get all days in the month
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        
        // Create weekly summaries
        const weeklySummaries: Array<{
          weekNumber: number;
          startDate: Date;
          endDate: Date;
          totalProfit: number;
          tradeCount: number;
        }> = [];
        
        // Initialize week pointers
        let currentStart = startOfWeek(monthStart);
        let currentEnd = endOfWeek(currentStart);
        
        // Loop through all weeks that intersect with the month
        while (currentStart <= monthEnd) {
          // Week number (1-5)
          const weekNumber = Math.ceil((currentStart.getDate()) / 7);
          
          // Get trades for this week
          const weekTrades = trades.filter(trade => {
            const closeDate = new Date(trade.closeDate);
            return isWithinInterval(closeDate, {
              start: currentStart,
              end: currentEnd
            });
          });
          
          // Calculate total profit
          const totalProfit = weekTrades.reduce((sum, trade) => sum + trade.profit, 0);
          
          weeklySummaries.push({
            weekNumber,
            startDate: currentStart,
            endDate: currentEnd,
            totalProfit,
            tradeCount: weekTrades.length
          });
          
          // Move to next week
          currentStart = new Date(currentEnd);
          currentStart.setDate(currentStart.getDate() + 1);
          currentEnd = endOfWeek(currentStart);
        }
        
        return weeklySummaries;
      },
      
      getMonthlyProfit: (monthDate) => {
        const { trades } = get();
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        
        const monthTrades = trades.filter(trade => {
          const closeDate = new Date(trade.closeDate);
          return isWithinInterval(closeDate, {
            start: monthStart,
            end: monthEnd
          });
        });
        
        return monthTrades.reduce((sum, trade) => sum + trade.profit, 0);
      }
    }),
    {
      name: 'trading-journal-storage',
      // Fix: Use storage and partialize options instead of serialize/deserialize
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          // Convert date strings back to Date objects
          if (parsed.state.selectedDate) {
            parsed.state.selectedDate = new Date(parsed.state.selectedDate);
          }
          return parsed;
        },
        setItem: (name, value) => {
          // Ensure dates are properly serialized
          const valueToStore = {
            ...value,
            state: {
              ...value.state,
              selectedDate: value.state.selectedDate instanceof Date 
                ? value.state.selectedDate.toISOString() 
                : new Date().toISOString()
            }
          };
          localStorage.setItem(name, JSON.stringify(valueToStore));
        },
        removeItem: (name) => localStorage.removeItem(name)
      }
    }
  )
);
