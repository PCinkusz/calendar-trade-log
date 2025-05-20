
import React from 'react';
import { format } from 'date-fns';
import { useTradeStore } from '@/store/tradeStore';
import { Button } from '@/components/ui/button';
import { TradeForm } from '@/components/TradeForm';
import { formatCurrency } from '@/lib/formatters';
import { Edit, Trash2 } from 'lucide-react';

interface TradeViewPopoverProps {
  date: Date;
  onAddClick: () => void;
  isAddingTrade?: boolean;
  onSuccess?: () => void;
  onEditClick?: (tradeId: string) => void;
}

export const TradeViewPopover: React.FC<TradeViewPopoverProps> = ({ 
  date,
  onAddClick,
  isAddingTrade = false,
  onSuccess,
  onEditClick
}) => {
  const { getTradesByDate, deleteTrade } = useTradeStore();
  const trades = getTradesByDate(date);
  
  if (isAddingTrade) {
    return <TradeForm onSuccess={onSuccess} />;
  }
  
  return (
    <div className="p-4 max-h-[400px] overflow-auto">
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-popover z-10 pb-2">
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
        <div className="space-y-3">
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
                  <div className="mt-1 text-xs text-muted-foreground">
                    <p>Open: {format(new Date(trade.openDate), 'h:mm a')} • {formatCurrency(trade.entryPrice)}</p>
                    <p>Close: {format(new Date(trade.closeDate), 'h:mm a')} • {formatCurrency(trade.exitPrice)}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`font-semibold ${trade.profit > 0 ? 'profit-text' : 'loss-text'}`}>
                    {formatCurrency(trade.profit)}
                  </span>
                  <div className="flex space-x-1 mt-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7" 
                      onClick={() => onEditClick && onEditClick(trade.id)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit trade</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7" 
                      onClick={() => deleteTrade(trade.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete trade</span>
                    </Button>
                  </div>
                </div>
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
