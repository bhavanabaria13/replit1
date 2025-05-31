import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw } from 'lucide-react';
import type { Ticket } from '@shared/schema';

interface TicketGridProps {
  tickets: Ticket[];
  userAddress?: string | null;
  onTicketSelect: (ticket: Ticket) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
  contractData?: {
    purchasedTickets: number[];
    userTickets: number[];
    availableTickets: number[];
  };
}

export function TicketGrid({ 
  tickets, 
  userAddress, 
  onTicketSelect, 
  isLoading = false,
  onRefresh,
  contractData 
}: TicketGridProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-10 lg:grid-cols-15 gap-3">
          {Array.from({ length: 50 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      </div>
    );
  }

  const getTicketStatus = (ticket: Ticket) => {
    // Use authentic SCAI contract data when available
    if (contractData) {
      const ticketNumber = ticket.ticketNumber ? parseInt(ticket.ticketNumber) : ticket.id;
      
      // Check if user owns this ticket (yellow)
      if (contractData.userTickets.includes(ticketNumber)) {
        return 'owned';
      }
      
      // Check if ticket is sold to someone else (red)
      if (contractData.purchasedTickets.includes(ticketNumber)) {
        return 'sold';
      }
      
      // Available ticket (green)
      return 'available';
    }
    
    // Fallback to database data
    if (!ticket.isAvailable) {
      if (ticket.purchaserAddress === userAddress) {
        return 'owned';
      }
      return 'sold';
    }
    return 'available';
  };

  const getTicketStyles = (status: string) => {
    switch (status) {
      case 'owned':
        return 'border-yellow-400 bg-yellow-400/20 cursor-default shadow-lg shadow-yellow-400/20';
      case 'sold':
        return 'border-red-500 bg-red-500/20 cursor-not-allowed opacity-60 grayscale';
      case 'available':
      default:
        return 'border-slate-600 hover:border-indigo-500 hover:bg-indigo-500/10 cursor-pointer transform hover:scale-105 transition-all duration-200';
    }
  };

  const getIndicatorColor = (status: string) => {
    switch (status) {
      case 'owned':
        return 'bg-yellow-400';
      case 'sold':
        return 'bg-red-500';
      case 'available':
      default:
        return 'bg-emerald-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-white">Available Tickets</h3>
        <div className="flex items-center space-x-4">
          <span className="text-slate-400 text-sm">Price: 0.01 ETH/SCAI per ticket</span>
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="text-indigo-400 hover:text-indigo-300 hover:bg-slate-700"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Ticket Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-10 lg:grid-cols-12 xl:grid-cols-15 gap-3">
        {tickets.map((ticket) => {
          const status = getTicketStatus(ticket);
          const isClickable = status === 'available';
          
          return (
            <Card
              key={ticket.id}
              className={`p-3 text-center transition-all duration-200 relative ${getTicketStyles(status)}`}
              onClick={() => isClickable && onTicketSelect(ticket)}
            >
              <div className="space-y-2">
                <div className="text-sm font-mono text-slate-300">
                  #{ticket.id.toString().padStart(3, '0')}
                </div>
                <div className="text-xs text-slate-400 truncate">
                  {ticket.ticketNumber}
                </div>
                <div className="flex justify-center">
                  <div className={`w-3 h-3 rounded-full ${getIndicatorColor(status)}`} />
                </div>
                {status === 'sold' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-500/80 rounded-lg">
                    <span className="text-xs font-bold text-white">SOLD</span>
                  </div>
                )}
                {status === 'owned' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-yellow-400/80 rounded-lg">
                    <span className="text-xs font-bold text-slate-900">YOURS</span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-center space-x-8 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full" />
          <span className="text-slate-400">Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <span className="text-slate-400">Sold</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-400 rounded-full" />
          <span className="text-slate-400">Your Tickets</span>
        </div>
      </div>
    </div>
  );
}
