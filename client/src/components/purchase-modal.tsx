import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePurchaseTicket, useEstimateGas } from '@/hooks/use-lottery';
import { Ticket } from 'lucide-react';
import type { Ticket as TicketType } from '@shared/schema';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: TicketType | null;
  network: string;
  onPurchaseSuccess?: () => void;
}

export function PurchaseModal({ isOpen, onClose, ticket, network, onPurchaseSuccess }: PurchaseModalProps) {
  const [gasEstimate, setGasEstimate] = useState('0.002');
  const purchaseTicket = usePurchaseTicket();
  const estimateGas = useEstimateGas();

  useEffect(() => {
    if (ticket && isOpen) {
      estimateGas.mutate(
        { ticketId: ticket.id, network },
        {
          onSuccess: (estimate) => {
            setGasEstimate(estimate);
          },
        }
      );
    }
  }, [ticket, network, isOpen]);

  const handlePurchase = async () => {
    if (!ticket) return;

    purchaseTicket.mutate(
      { ticketId: ticket.id, network },
      {
        onSuccess: () => {
          onPurchaseSuccess?.(); // Trigger confetti!
          setTimeout(() => {
            onClose();
          }, 500); // Delay closing to show confetti
        },
      }
    );
  };

  const handleClose = () => {
    if (!purchaseTicket.isPending) {
      onClose();
    }
  };

  if (!ticket) return null;

  const ticketPrice = '0.01';
  const total = (parseFloat(ticketPrice) + parseFloat(gasEstimate)).toFixed(4);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-8 h-8 text-indigo-500" />
            </div>
            <DialogTitle className="text-xl font-bold mb-2">Purchase Ticket</DialogTitle>
            <p className="text-slate-400">Confirm your lottery ticket purchase</p>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 mt-6">
          <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Ticket Number:</span>
              <span className="font-mono text-indigo-400">
                #{ticket.ticketIndex.toString().padStart(3, '0')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Ticket ID:</span>
              <span className="text-sm text-slate-300">{ticket.ticketNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Price:</span>
              <span className="font-medium">{ticketPrice} SCAI</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Estimated Gas:</span>
              <span className="text-sm text-slate-400">
                ~{gasEstimate} SCAI
              </span>
            </div>
            <div className="border-t border-slate-700 pt-2">
              <div className="flex justify-between items-center font-medium">
                <span className="text-white">Total:</span>
                <span className="text-white">~{total} SCAI</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={purchaseTicket.isPending}
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={purchaseTicket.isPending}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium"
            >
              {purchaseTicket.isPending ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                'Confirm Purchase'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
