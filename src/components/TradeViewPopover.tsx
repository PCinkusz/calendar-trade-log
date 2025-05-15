
import React from 'react';
import { format } from 'date-fns';
import { useTradeStore } from '@/store/tradeStore';
import { Button } from '@/components/ui/button';
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
        <div className="space-y-4">
          {trades.map((trade) => (
            <div 
              key={trade.id} 
              className="p-3 border rounded-lg shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{trade.symbol}</h4>
                  <p className="text-sm text-muted-foreground">
                    {trade.type === 'buy' ? 'Long' : 'Short'} • {format(new Date(trade.closeDate), 'h:mm a')}
                  </p>
                </div>
                <span className={`font-semibold ${trade.profit > 0 ? 'profit-text' : 'loss-text'}`}>
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(trade.profit)}
                </span>
              </div>
              {trade.notes && <p className="mt-2 text-sm border-t pt-2">{trade.notes}</p>}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No trades for this day
        </div>
      )}
    </div>
  );
};
