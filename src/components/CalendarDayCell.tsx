
import React from 'react';
import { format } from 'date-fns';
import { useTradeStore } from '@/store/tradeStore';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';

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
  const dayTrades = getTradesByDate(date);
  
  const totalProfit = dayTrades.reduce((sum, trade) => sum + trade.profit, 0);
  const tradeCount = dayTrades.length;
  
  const isProfitableDay = totalProfit > 0;
  const isUnprofitableDay = totalProfit < 0;
  
  let dayClass = "calendar-day ";
  if (isSelected) dayClass += "ring-2 ring-primary ring-inset ";
  if (!isCurrentMonth) dayClass += "opacity-40 ";
  if (tradeCount > 0) {
    if (isProfitableDay) dayClass += "trade-day-profit ";
    if (isUnprofitableDay) dayClass += "trade-day-loss ";
  }
  
  return (
    <div 
      className={dayClass}
      onClick={onSelectDate}
      role="button"
      tabIndex={0}
      aria-label={`Select ${format(date, 'MMMM d, yyyy')}`}
    >
      <div className="text-right text-sm p-1">{format(date, 'd')}</div>
      
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
  );
};
