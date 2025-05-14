
export type Trade = {
  id: string;
  date: Date;
  openDate: Date;
  closeDate: Date;
  symbol: string;
  type: 'buy' | 'sell';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  profit: number;
  notes: string;
  tags?: string[];
};

export type DayTrades = {
  date: Date;
  trades: Trade[];
  totalProfit: number;
};

export type WeekSummary = {
  weekNumber: number;
  totalProfit: number;
  tradeCount: number;
};
