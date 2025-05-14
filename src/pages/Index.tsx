
import React from 'react';
import { CalendarView } from '@/components/CalendarView';
import { SummarySidebar } from '@/components/SummarySidebar';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b py-4 px-6 shadow-sm bg-card">
        <h1 className="text-2xl font-bold text-primary">Trading Journal</h1>
      </header>
      
      <main className="container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <CalendarView />
          </div>
          <div className="lg:col-span-1">
            <SummarySidebar />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
