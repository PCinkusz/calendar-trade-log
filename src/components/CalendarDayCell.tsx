
import React, { useState } from 'react';
import { format } from 'date-fns';
import { useTradeStore } from '@/store/tradeStore';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TradeForm } from './TradeForm';
import { Note, Plus } from 'lucide-react';
import { Button } from './ui/button';

type CalendarDayCellProps = {
  date: Date;
  isCurrentMonth: boolean;
  isSelected: boolean;
  onSelectDate: () => void;
};

export const CalendarDayCell: React.FC<CalendarDayCellProps> = ({
  date,
  isCurrentMonth,
  isSelected,
  onSelectDate,
}) => {
  const { getTradesByDate } = useTradeStore();
  const [isAddTradeOpen, setIsAddTradeOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const dayTrades = getTradesByDate(date);
  
  const totalProfit = dayTrades.reduce((sum, trade) => sum + trade.profit, 0);
  const tradeCount = dayTrades.length;
  const winningTrades = dayTrades.filter(trade => trade.profit > 0).length;
  
  const isProfitableDay = totalProfit > 0;
  const isUnprofitableDay = totalProfit < 0;
  const winRate = tradeCount > 0 ? Math.round((winningTrades / tradeCount) * 100) : 0;
  
  const hasNotes = dayTrades.some(trade => trade.notes && trade.notes.trim() !== '');
  
  // Get unique symbols for the day
  const symbols = [...new Set(dayTrades.map(trade => trade.symbol))];
  
  return (
    <>
      <div 
        className={cn(
          "calendar-day rounded-xl hover:shadow-md transition-all cursor-pointer relative overflow-hidden",
          isSelected ? "ring-2 ring-primary ring-inset" : "",
          !isCurrentMonth ? "opacity-40" : "",
          tradeCount > 0 && isProfitableDay ? "trade-day-profit" : "",
          tradeCount > 0 && isUnprofitableDay ? "trade-day-loss" : ""
        )}
        onClick={onSelectDate}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="button"
        tabIndex={0}
        aria-label={`Select ${format(date, 'MMMM d, yyyy')}`}
      >
        <div className="flex justify-between items-start p-1">
          <div className="relative z-10">
            {hasNotes && (
              <Note className="h-4 w-4 text-primary opacity-70" />
            )}
          </div>
          <div className="text-sm font-medium p-1">
            {format(date, 'd')}
          </div>
        </div>
        
        {/* Add trade button that slides down on hover */}
        <div 
          className={cn(
            "absolute inset-x-0 top-0 flex justify-center transition-transform duration-300 z-20",
            isHovered ? "translate-y-0" : "-translate-y-full"
          )}
        >
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 bg-background/80 backdrop-blur-sm rounded-full shadow-md"
            onClick={(e) => {
              e.stopPropagation();
              onSelectDate();
              setIsAddTradeOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Add trade</span>
          </Button>
        </div>
        
        {tradeCount > 0 && (
          <div className="p-2 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs">
                {tradeCount} {tradeCount === 1 ? 'trade' : 'trades'}
              </span>
              <span className={cn(
                "font-semibold text-lg",
                isProfitableDay ? "profit-text" : isUnprofitableDay ? "loss-text" : ""
              )}>
                {formatCurrency(totalProfit)}
              </span>
            </div>
            
            <div className="text-xs">
              Win rate: <span className={winRate > 50 ? "profit-text" : "loss-text"}>{winRate}%</span>
            </div>
            
            {symbols.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {symbols.map(symbol => (
                  <div 
                    key={symbol} 
                    className={cn(
                      "text-xs px-1.5 py-0.5 rounded-full",
                      isProfitableDay ? "bg-[hsl(var(--profit-background))] text-[hsl(var(--profit))]" : 
                      isUnprofitableDay ? "bg-[hsl(var(--loss-background))] text-[hsl(var(--loss))]" : 
                      "bg-muted text-muted-foreground"
                    )}
                  >
                    {symbol}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      <Dialog open={isAddTradeOpen} onOpenChange={setIsAddTradeOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-xl shadow-xl border-2">
          <DialogHeader>
            <DialogTitle>Add Trade for {format(date, 'MMMM d, yyyy')}</DialogTitle>
            <DialogDescription>
              Enter the details of your trade below.
            </DialogDescription>
          </DialogHeader>
          <TradeForm onSuccess={() => setIsAddTradeOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};
