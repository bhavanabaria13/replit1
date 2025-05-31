import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserTickets, useUserTransactions } from '@/hooks/use-lottery';
import { Ticket, ShoppingCart, Trophy, History } from 'lucide-react';
import type { Ticket as TicketType, Transaction } from '@shared/schema';

interface UserDashboardProps {
  userAddress: string | null;
}

export function UserDashboard({ userAddress }: UserDashboardProps) {
  const { data: userTickets, isLoading: ticketsLoading } = useUserTickets(userAddress);
  const { data: transactions, isLoading: transactionsLoading } = useUserTransactions(userAddress);

  if (!userAddress) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-slate-800/80 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Ticket className="w-5 h-5 text-indigo-500 mr-2" />
              My Tickets
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8 text-slate-400">
            <Ticket className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Connect your wallet to view your tickets</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/80 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <History className="w-5 h-5 text-purple-500 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8 text-slate-400">
            <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Connect your wallet to view transaction history</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* My Tickets */}
      <Card className="bg-slate-800/80 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Ticket className="w-5 h-5 text-indigo-500 mr-2" />
            My Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ticketsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : userTickets && userTickets.length > 0 ? (
            <div className="space-y-3">
              {userTickets.map((ticket: TicketType) => (
                <div
                  key={ticket.id}
                  className="bg-slate-900/50 rounded-lg p-4 border border-yellow-400/30"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-mono text-lg text-yellow-400 mb-1">
                        #{ticket.ticketIndex.toString().padStart(3, '0')}
                      </div>
                      <div className="text-sm text-slate-400 mb-2">{ticket.ticketNumber}</div>
                      {ticket.purchasedAt && (
                        <div className="text-xs text-slate-500">
                          Purchased: {new Date(ticket.purchasedAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-400">Price Paid</div>
                      <div className="text-sm text-emerald-400 font-medium">
                        {ticket.purchasePrice} ETH
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Ticket className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No tickets purchased yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="bg-slate-800/80 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <History className="w-5 h-5 text-purple-500 mr-2" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : transactions && transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.slice(0, 5).map((tx: Transaction) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3 border-b border-slate-700/50 last:border-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === 'purchase' 
                        ? 'bg-emerald-500/20' 
                        : 'bg-yellow-400/20'
                    }`}>
                      {tx.type === 'purchase' ? (
                        <ShoppingCart className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Trophy className="w-4 h-4 text-yellow-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">
                        {tx.type === 'purchase' ? 'Ticket Purchase' : 'Lottery Win'}
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      tx.type === 'purchase' ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                      {tx.type === 'purchase' ? '-' : '+'}{tx.amount} ETH
                    </div>
                    <div className="text-xs text-slate-400 capitalize">
                      {tx.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No transaction history</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
