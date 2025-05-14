
import React, { useState } from 'react';
import { format } from 'date-fns';
import { useTradeStore } from '@/store/tradeStore';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TradeForm } from './TradeForm';
import { Plus } from 'lucide-react';
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
  
  const dayTrades = getTradesByDate(date);
  
  const totalProfit = dayTrades.reduce((sum, trade) => sum + trade.profit, 0);
  const tradeCount = dayTrades.length;
  
  const isProfitableDay = totalProfit > 0;
  const isUnprofitableDay = totalProfit < 0;
  
  return (
    <>
      <div 
        className={cn(
          "calendar-day rounded-xl hover:shadow-md transition-all cursor-pointer",
          isSelected ? "ring-2 ring-primary ring-inset" : "",
          !isCurrentMonth ? "opacity-40" : "",
          tradeCount > 0 && isProfitableDay ? "trade-day-profit" : "",
          tradeCount > 0 && isUnprofitableDay ? "trade-day-loss" : ""
        )}
        onClick={onSelectDate}
        role="button"
        tabIndex={0}
        aria-label={`Select ${format(date, 'MMMM d, yyyy')}`}
      >
        <div className="flex justify-between items-center p-1">
          <div className="text-sm p-1">{format(date, 'd')}</div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 opacity-0 hover:opacity-100 focus:opacity-100 rounded-full"
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
          <div className="p-1">
            <div className={cn(
              "font-semibold text-lg",
              isProfitableDay ? "profit-text" : isUnprofitableDay ? "loss-text" : ""
            )}>
              {formatCurrency(totalProfit)}
            </div>
            <div className="text-sm">
              {tradeCount} {tradeCount === 1 ? 'trade' : 'trades'}
            </div>
            {dayTrades.length > 0 && dayTrades[0].symbol && (
              <div className="text-xs truncate">
                {isProfitableDay && <span className="inline-block w-2 h-2 rounded-full bg-profit mr-1"></span>}
                {isUnprofitableDay && <span className="inline-block w-2 h-2 rounded-full bg-loss mr-1"></span>}
                {dayTrades[0].symbol}
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
