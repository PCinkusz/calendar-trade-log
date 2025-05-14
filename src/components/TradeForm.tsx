
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTradeStore } from '@/store/tradeStore';
import { Trade } from '@/types/trade';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Clock } from 'lucide-react';

const TradeFormSchema = z.object({
  openDate: z.date({
    required_error: 'Open date is required',
  }),
  closeDate: z.date({
    required_error: 'Close date is required',
  }),
  symbol: z.string().min(1, 'Symbol is required'),
  type: z.enum(['buy', 'sell']),
  entryPrice: z.coerce.number().positive('Entry price must be positive'),
  exitPrice: z.coerce.number().positive('Exit price must be positive'),
  quantity: z.coerce.number().positive('Quantity must be positive'),
  profit: z.coerce.number(),
  notes: z.string().optional(),
});

type TradeFormProps = {
  onSuccess: () => void;
  editingTrade?: Trade;
};

export const TradeForm: React.FC<TradeFormProps> = ({ onSuccess, editingTrade }) => {
  const { addTrade, updateTrade, selectedDate } = useTradeStore();
  
  const form = useForm<z.infer<typeof TradeFormSchema>>({
    resolver: zodResolver(TradeFormSchema),
    defaultValues: editingTrade ? {
      ...editingTrade,
      openDate: new Date(editingTrade.openDate),
      closeDate: new Date(editingTrade.closeDate),
    } : {
      openDate: selectedDate,
      closeDate: selectedDate,
      symbol: '',
      type: 'buy' as const,
      entryPrice: 0,
      exitPrice: 0,
      quantity: 0,
      profit: 0,
      notes: '',
    },
  });
  
  const onSubmit = (data: z.infer<typeof TradeFormSchema>) => {
    if (editingTrade) {
      updateTrade(editingTrade.id, data);
    } else {
      // We use closeDate as the primary date for the trade 
      addTrade({
        date: data.closeDate,
        openDate: data.openDate,
        closeDate: data.closeDate,
        symbol: data.symbol,
        type: data.type,
        entryPrice: data.entryPrice,
        exitPrice: data.exitPrice,
        quantity: data.quantity,
        profit: data.profit,
        notes: data.notes || '',
      });
    }
    onSuccess();
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="openDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Open Date & Time</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal rounded-xl shadow-sm border-2",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP p')
                        ) : (
                          <span>Pick open date/time</span>
                        )}
                        <Clock className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-xl shadow-md" align="start">
                    <div className="p-3">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          if (date) {
                            const newDate = new Date(date);
                            const currentValue = field.value || new Date();
                            newDate.setHours(currentValue.getHours());
                            newDate.setMinutes(currentValue.getMinutes());
                            field.onChange(newDate);
                          }
                        }}
                        initialFocus
                        className={cn("pb-3 pointer-events-auto")}
                      />
                      <div className="flex items-center gap-2 pt-3 border-t">
                        <Input
                          type="time"
                          className="rounded-xl"
                          value={field.value ? format(field.value, 'HH:mm') : ''}
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(':').map(Number);
                            const newDate = new Date(field.value || new Date());
                            newDate.setHours(hours || 0);
                            newDate.setMinutes(minutes || 0);
                            field.onChange(newDate);
                          }}
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="closeDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Close Date & Time</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal rounded-xl shadow-sm border-2",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP p')
                        ) : (
                          <span>Pick close date/time</span>
                        )}
                        <Clock className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-xl shadow-md" align="start">
                    <div className="p-3">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          if (date) {
                            const newDate = new Date(date);
                            const currentValue = field.value || new Date();
                            newDate.setHours(currentValue.getHours());
                            newDate.setMinutes(currentValue.getMinutes());
                            field.onChange(newDate);
                          }
                        }}
                        initialFocus
                        className={cn("pb-3 pointer-events-auto")}
                      />
                      <div className="flex items-center gap-2 pt-3 border-t">
                        <Input
                          type="time"
                          className="rounded-xl"
                          value={field.value ? format(field.value, 'HH:mm') : ''}
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(':').map(Number);
                            const newDate = new Date(field.value || new Date());
                            newDate.setHours(hours || 0);
                            newDate.setMinutes(minutes || 0);
                            field.onChange(newDate);
                          }}
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="symbol"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Symbol</FormLabel>
              <FormControl>
                <Input placeholder="AAPL" className="rounded-xl shadow-sm border-2" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="rounded-xl shadow-sm border-2">
                    <SelectValue placeholder="Select trade type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl shadow-md">
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="entryPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entry Price</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    className="rounded-xl shadow-sm border-2" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="exitPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exit Price</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00"
                    className="rounded-xl shadow-sm border-2" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Volume</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0"
                    className="rounded-xl shadow-sm border-2" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="profit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profit/Loss</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00"
                    className={cn(
                      "rounded-xl shadow-sm border-2",
                      parseFloat(field.value as any) > 0 ? "text-[hsl(var(--profit))]" : 
                      parseFloat(field.value as any) < 0 ? "text-[hsl(var(--loss))]" : ""
                    )}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add your trade notes here..." 
                  className="resize-none rounded-xl shadow-sm border-2" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full rounded-xl shadow-md hover:shadow-lg transition-all">
          {editingTrade ? 'Update Trade' : 'Add Trade'}
        </Button>
      </form>
    </Form>
  );
};
