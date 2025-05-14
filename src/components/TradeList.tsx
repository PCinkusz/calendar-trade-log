
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useTradeStore } from '@/store/tradeStore';
import { TradeForm } from './TradeForm';
import { formatCurrency } from '@/lib/formatters';
import { Trade } from '@/types/trade';

export const TradeList = () => {
  const { selectedDate, getTradesByDate, deleteTrade } = useTradeStore();
  const [editingTrade, setEditingTrade] = useState<Trade | undefined>(undefined);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const trades = getTradesByDate(selectedDate);
  const totalProfit = trades.reduce((sum, trade) => sum + trade.profit, 0);
  
  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
    setIsEditDialogOpen(true);
  };
  
  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingTrade(undefined);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          Trades for {format(selectedDate, 'MMMM d, yyyy')}
        </h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Add Trade</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Trade</DialogTitle>
              <DialogDescription>
                Enter the details of your trade below.
              </DialogDescription>
            </DialogHeader>
            <TradeForm
              onSuccess={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      {trades.length === 0 ? (
        <Card className="p-6 text-center text-gray-500">
          No trades recorded for this date.
        </Card>
      ) : (
        <div className="space-y-3">
          <Card className="p-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Profit/Loss:</span>
              <span className={totalProfit > 0 ? "profit-text font-bold" : totalProfit < 0 ? "loss-text font-bold" : ""}>
                {formatCurrency(totalProfit)}
              </span>
            </div>
          </Card>
          
          {trades.map((trade) => (
            <Card key={trade.id} className="p-4">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium">{trade.symbol}</h3>
                  <div className="text-sm text-muted-foreground">
                    {trade.type.toUpperCase()} - {trade.quantity} shares
                  </div>
                </div>
                <div className="text-right">
                  <div className={trade.profit > 0 ? "profit-text font-bold" : trade.profit < 0 ? "loss-text font-bold" : ""}>
                    {formatCurrency(trade.profit)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Entry: {formatCurrency(trade.entryPrice)} | Exit: {formatCurrency(trade.exitPrice)}
                  </div>
                </div>
              </div>
              
              {trade.notes && (
                <div className="mt-2 text-sm border-t pt-2">
                  {trade.notes}
                </div>
              )}
              
              <div className="flex justify-end mt-2 space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditTrade(trade)}
                >
                  Edit
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">Delete</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this trade
                        record from your journal.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteTrade(trade.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
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
