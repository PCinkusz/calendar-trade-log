import React, { useState } from 'react';
import { format } from 'date-fns';
import { useTradeStore } from '@/store/tradeStore';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TradeForm } from './TradeForm';
import { FileText, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { TradeViewPopover } from './TradeViewPopover';

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
  
  const getMostImportantSymbol = () => {
    if (tradeCount === 0) return null;
    
    const sortedTrades = [...dayTrades].sort((a, b) => 
      Math.abs(b.profit) - Math.abs(a.profit)
    );
    
    return sortedTrades[0].symbol;
  };
  
  const mostImportantSymbol = getMostImportantSymbol();
  
  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <div 
            className={cn(
              "calendar-day rounded-xl hover:shadow-md hover:scale-105 transition-all cursor-pointer relative overflow-hidden",
              isSelected ? "ring-1 ring-primary/30" : "",
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
            <div className="flex justify-between items-start p-2">
              <div className="relative z-10">
                {hasNotes && (
                  <FileText className="h-4 w-4 text-foreground opacity-70" />
                )}
              </div>
              <div className="text-sm font-medium">
                {format(date, 'd')}
              </div>
            </div>
            
            <div 
              className={cn(
                "absolute inset-x-0 -top-8 flex justify-center transition-transform duration-300 z-20",
                isHovered ? "translate-y-8" : "translate-y-0"
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
              <div className="p-2 space-y-0.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs">
                    {tradeCount} {tradeCount === 1 ? 'trade' : 'trades'}
                  </span>
                  <span className={cn(
                    "font-semibold text-xl", 
                    isProfitableDay ? "profit-text" : isUnprofitableDay ? "loss-text" : ""
                  )}>
                    {formatCurrency(totalProfit)}
                  </span>
                </div>
                
                <div className="text-sm text-primary font-medium">
                  {winRate}%
                </div>
                
                {mostImportantSymbol && (
                  <div className="flex flex-wrap gap-1">
                    <div 
                      className={cn(
                        "text-xs px-1.5 py-0.5 rounded-full",
                        isProfitableDay ? "bg-[hsl(var(--profit-background))] text-[hsl(var(--profit))]" : 
                        isUnprofitableDay ? "bg-[hsl(var(--loss-background))] text-[hsl(var(--loss))]" : 
                        "bg-muted text-muted-foreground"
                      )}
                    >
                      {mostImportantSymbol}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[500px] p-0" align="center">
          <TradeViewPopover date={date} onAddClick={() => setIsAddTradeOpen(true)} />
        </PopoverContent>
      </Popover>
      
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