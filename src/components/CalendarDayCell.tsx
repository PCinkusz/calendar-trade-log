import React, { useState, useRef } from 'react';
import { format } from 'date-fns';
import { useTradeStore } from '@/store/tradeStore';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';
import { FileText, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent } from './ui/dialog';
import { TradeViewPopover } from './TradeViewPopover';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { TradeForm } from './TradeForm';

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
  const [isEditTradeOpen, setIsEditTradeOpen] = useState(false);
  const [editTradeId, setEditTradeId] = useState<string | null>(null);
  const [isTradePopoverOpen, setIsTradePopoverOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cellRef = useRef<HTMLDivElement>(null);
  
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
  
  const handleDayClick = () => {
    onSelectDate();
    setIsTradePopoverOpen(true);
  };

  const handleEditClick = (tradeId: string) => {
    setEditTradeId(tradeId);
    setIsEditTradeOpen(true);
    setIsTradePopoverOpen(false);
  };
  
  return (
    <>
      <div 
        ref={cellRef}
        className={cn(
          "calendar-day rounded-xl hover:shadow-md transition-all cursor-pointer relative overflow-hidden",
          isSelected ? "ring-1 ring-primary/30" : "",
          !isCurrentMonth ? "opacity-40" : "",
          tradeCount > 0 && isProfitableDay ? "trade-day-profit" : "",
          tradeCount > 0 && isUnprofitableDay ? "trade-day-loss" : ""
        )}
        onClick={handleDayClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="button"
        tabIndex={0}
        aria-label={`Select ${format(date, 'MMMM d, yyyy')}`}
      >
        <div className="flex justify-between items-start">
          <div className="relative z-10 p-2">
            {hasNotes && (
              <FileText className="h-4 w-4 text-foreground opacity-70" />
            )}
          </div>
          <div className="text-sm font-medium p-2">
            {format(date, 'd')}
          </div>
        </div>
        
        <div 
          className={cn(
            "absolute inset-x-0 -top-14 flex justify-center transition-transform duration-300 z-20",
            isHovered ? "translate-y-14" : "translate-y-0"
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
          <div className="p-1 px-2 flex flex-col items-end">
            <span className={cn(
              "font-semibold text-xl", 
              isProfitableDay ? "profit-text" : isUnprofitableDay ? "loss-text" : ""
            )}>
              {formatCurrency(totalProfit).replace(/\s/g, '')}
            </span>
            
            <div className="flex flex-col items-end text-xs">
              <span className="text-muted-foreground">
                {tradeCount} {tradeCount === 1 ? 'trade' : 'trades'}
              </span>
              <span className="text-[hsl(var(--primary))]">
                WR: {winRate}%
              </span>
              {mostImportantSymbol && (
                <div 
                  className={cn(
                    "px-1 py-0.5 rounded-full w-fit",
                    isProfitableDay ? "bg-[hsl(var(--profit-background))] text-[hsl(var(--profit))]" : 
                    isUnprofitableDay ? "bg-[hsl(var(--loss-background))] text-[hsl(var(--loss))]" : 
                    "bg-muted text-muted-foreground"
                  )}
                >
                  {mostImportantSymbol}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <Popover open={isTradePopoverOpen} onOpenChange={setIsTradePopoverOpen}>
        <PopoverTrigger className="hidden" />
        <PopoverContent 
          className="w-[350px] max-h-[500px] overflow-auto p-0 shadow-lg"
          side="bottom"
          align="start"
          alignOffset={-15}
          sideOffset={5}
          avoidCollisions={true}
        >
          <TradeViewPopover 
            date={date} 
            onAddClick={() => setIsAddTradeOpen(true)}
            onEditClick={handleEditClick}
          />
        </PopoverContent>
      </Popover>
      
      <Dialog open={isAddTradeOpen} onOpenChange={setIsAddTradeOpen}>
        <DialogContent className="max-w-md mx-auto p-6">
          <h2 className="text-xl font-bold mb-4">Add Trade for {format(date, 'MMMM d, yyyy')}</h2>
          <TradeForm onSuccess={() => setIsAddTradeOpen(false)} />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isEditTradeOpen} onOpenChange={setIsEditTradeOpen}>
        <DialogContent className="max-w-md mx-auto p-6">
          <h2 className="text-xl font-bold mb-4">Edit Trade</h2>
          <TradeForm 
            tradeId={editTradeId || undefined} 
            onSuccess={() => {
              setIsEditTradeOpen(false);
              setEditTradeId(null);
            }} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
