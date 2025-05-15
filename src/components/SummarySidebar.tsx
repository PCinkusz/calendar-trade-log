
import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTradeStore } from '@/store/tradeStore';
import { formatCurrency } from '@/lib/formatters';

export const SummarySidebar = () => {
  const { getWeeklySummaries, getMonthlyProfit, selectedDate } = useTradeStore();
  
  // Check if selectedDate is a valid Date object, if not create a new one
  const validSelectedDate = selectedDate instanceof Date && !isNaN(selectedDate.getTime()) 
    ? selectedDate 
    : new Date();
  
  // Use the current month from the selected date
  const currentMonth = new Date(validSelectedDate.getFullYear(), validSelectedDate.getMonth(), 1);
  
  const weeklySummaries = getWeeklySummaries(currentMonth);
  const monthlyProfit = getMonthlyProfit(currentMonth);
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Monthly Stats: {format(currentMonth, 'MMMM yyyy')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="font-medium">Total P/L:</span>
              <span className={monthlyProfit > 0 ? "profit-text font-bold" : monthlyProfit < 0 ? "loss-text font-bold" : ""}>
                {formatCurrency(monthlyProfit)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Trade count:</span>
              <span className="text-sm font-medium">
                {weeklySummaries.reduce((sum, week) => sum + week.tradeCount, 0)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {weeklySummaries.map((week) => (
        <Card key={week.weekNumber} className={
          week.totalProfit > 0 
            ? "border-l-4 border-l-[hsl(var(--profit))]" 
            : week.totalProfit < 0 
              ? "border-l-4 border-l-[hsl(var(--loss))]" 
              : ""
        }>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Week {week.weekNumber}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className={
                  week.totalProfit > 0 
                    ? "profit-text font-bold text-lg" 
                    : week.totalProfit < 0 
                      ? "loss-text font-bold text-lg" 
                      : "text-lg"
                }>
                  {formatCurrency(week.totalProfit)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {week.tradeCount} {week.tradeCount === 1 ? 'trade' : 'trades'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
