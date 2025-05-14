
import React from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useTradeStore } from '@/store/tradeStore';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CalendarDayCell } from './CalendarDayCell';

export const CalendarView = () => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const { setSelectedDate, selectedDate } = useTradeStore();
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };
  
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="w-full bg-card rounded-md shadow-sm">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={prevMonth}
            aria-label="Previous month"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <h2 className="text-xl font-semibold">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={nextMonth}
            aria-label="Next month"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline"
            onClick={goToToday}
            className="ml-2"
          >
            Today
          </Button>
        </div>
        
        <div>
          <Button variant="outline" className="bg-primary text-primary-foreground">
            Choose your dashboard view
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-px border-b">
        {weekdays.map(day => (
          <div key={day} className="p-2 text-center font-medium">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-px">
        {monthDays.map(day => (
          <CalendarDayCell 
            key={day.toString()} 
            date={day} 
            isCurrentMonth={isSameMonth(day, currentMonth)}
            isSelected={isSameDay(day, selectedDate)}
            onSelectDate={() => setSelectedDate(day)}
          />
        ))}
      </div>
    </div>
  );
};
