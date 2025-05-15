
import React, { useState } from 'react';
import { format } from 'date-fns';
import { useTradeStore } from '@/store/tradeStore';
import { Button } from '@/components/ui/button';
import { TradeList } from '@/components/TradeList';
import { TradeForm } from '@/components/TradeForm';

interface TradeViewPopoverProps {
  date: Date;
  onAddClick: () => void;
  isAddingTrade?: boolean;
  onSuccess?: () => void;
}

export const TradeViewPopover: React.FC<TradeViewPopoverProps> = ({ 
  date,
  onAddClick,
  isAddingTrade = false,
  onSuccess
}) => {
  const { getTradesByDate } = useTradeStore();
  const trades = getTradesByDate(date);
  
  if (isAddingTrade) {
    return <TradeForm onSuccess={onSuccess} />;
  }
  
  return (
    <div className="p-4 max-h-[80vh] overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{format(date, 'MMMM d, yyyy')}</h3>
        <Button 
          variant="outline"
          size="sm"
          onClick={onAddClick}
        >
          Add Trade
        </Button>
      </div>
      
      {trades.length > 0 ? (
        <TradeList trades={trades} showDate={false} />
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No trades for this day
        </div>
      )}
    </div>
  );
};
