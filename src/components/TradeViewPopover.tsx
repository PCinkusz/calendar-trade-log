
import React from 'react';
import { format } from 'date-fns';
import { useTradeStore } from '@/store/tradeStore';
import { formatCurrency } from '@/lib/formatters';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus } from 'lucide-react';
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
    <div className="space-y-3">
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
          
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {trades.map((trade) => (
              <Card key={trade.id} className="p-3 shadow-sm">
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-medium">{trade.symbol}</h4>
                    <div className="text-xs text-muted-foreground">
                      {trade.type.toUpperCase()} • {trade.quantity} shares
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={trade.profit > 0 ? "profit-text font-bold" : "loss-text font-bold"}>
                      {formatCurrency(trade.profit)}
                    </div>
                  </div>
                </div>
                
                {trade.notes && (
                  <div className="mt-1 text-xs border-t pt-1 text-muted-foreground">
                    {trade.notes}
                  </div>
                )}
                
                <div className="flex justify-end mt-2 gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs rounded-lg"
                    onClick={() => handleEditTrade(trade)}
                  >
                    Edit
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="h-7 px-2 text-xs rounded-lg"
                      >
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-xl shadow-xl border-2">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete this trade
                          record from your journal.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          className="rounded-lg" 
                          onClick={() => deleteTrade(trade.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
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
