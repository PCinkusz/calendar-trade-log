import React from 'react';
import { format } from 'date-fns';
import { useTradeStore } from '@/store/tradeStore';
import { formatCurrency } from '@/lib/formatters';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { Trade } from '@/types/trade';
import { TradeForm } from './TradeForm';

type TradeViewPopoverProps = {
  date: Date;
  onAddClick: () => void;
};

export const TradeViewPopover: React.FC<TradeViewPopoverProps> = ({ date, onAddClick }) => {
  const { getTradesByDate, deleteTrade } = useTradeStore();
  const [editingTrade, setEditingTrade] = React.useState<Trade | undefined>(undefined);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  const trades = getTradesByDate(date);
  const totalProfit = trades.reduce((sum, trade) => sum + trade.profit, 0);
  const winningTrades = trades.filter(trade => trade.profit > 0).length;
  const winRate = trades.length > 0 ? Math.round((winningTrades / trades.length) * 100) : 0;

  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingTrade(undefined);
  };

  return (
    <div className="space-y-3 p-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">{format(date, 'MMMM d, yyyy')}</h3>
        <Button 
          size="sm" 
          onClick={onAddClick}
          className="rounded-lg flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>
      
      {trades.length > 0 ? (
        <>
          <Card className="p-2 shadow-sm">
            <div className="flex justify-between text-sm">
              <div>
                <span className="text-muted-foreground">Trades:</span> {trades.length}
              </div>
              <div>
                <span className="text-muted-foreground">Win Rate:</span> 
                <span className={`ml-1 ${winRate > 50 ? "profit-text" : "loss-text"}`}>
                  {winRate}%
                </span>
              </div>
            </div>
            <div className="text-lg font-semibold mt-1">
              <span className={totalProfit > 0 ? "profit-text" : totalProfit < 0 ? "loss-text" : ""}>
                {formatCurrency(totalProfit)}
              </span>
            </div>
          </Card>
          
          <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1">
            {trades.map((trade) => (
              <Card key={trade.id} className="p-3 shadow-sm">
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-medium">{trade.symbol}</h4>
                    <div className="text-xs text-muted-foreground">
                      {trade.type.toUpperCase()} • {trade.quantity} shares
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Entry: {formatCurrency(trade.entryPrice)} | Exit: {formatCurrency(trade.exitPrice)}
                    </div>
                    <div className="text-xs">
                      Open: {format(new Date(trade.openDate), 'MMM d, p')}
                    </div>
                    <div className="text-xs">
                      Close: {format(new Date(trade.closeDate), 'MMM d, p')}
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <div className={trade.profit > 0 ? "profit-text font-bold" : "loss-text font-bold"}>
                      {formatCurrency(trade.profit)}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleEditTrade(trade)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => deleteTrade(trade.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {trade.notes && (
                  <div className="mt-2 text-sm border-t pt-2 text-muted-foreground">
                    {trade.notes}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </>
      ) : (
        <div className="py-4 text-center text-muted-foreground">
          No trades for this day
        </div>
      )}
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-xl shadow-xl border-2">
          <DialogHeader>
            <DialogTitle>Edit Trade</DialogTitle>
            <DialogDescription>
              Update the details of your trade.
            </DialogDescription>
          </DialogHeader>
          {editingTrade && (
            <TradeForm
              editingTrade={editingTrade}
              onSuccess={closeEditDialog}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};