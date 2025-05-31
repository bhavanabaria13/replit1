import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, User, Coins } from 'lucide-react';
import type { LotteryRound } from '@shared/schema';

interface WinnerHistoryProps {
  pastRounds: LotteryRound[];
  isLoading?: boolean;
}

export function WinnerHistory({ pastRounds, isLoading = false }: WinnerHistoryProps) {
  if (isLoading) {
    return (
      <Card className="bg-slate-800/80 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
            Winner History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-700/50 h-16 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!pastRounds || pastRounds.length === 0) {
    return (
      <Card className="bg-slate-800/80 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
            Winner History
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-slate-600" />
          <p className="text-slate-400">No lottery rounds completed yet</p>
          <p className="text-sm text-slate-500 mt-2">Winners will appear here after each draw</p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card className="bg-slate-800/80 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
          Winner History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pastRounds.slice(0, 10).map((round, index) => (
            <div
              key={round.id}
              className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-slate-900" />
                    </div>
                    {index === 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">!</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-white">
                        Round #{round.roundNumber}
                      </span>
                      <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400">
                        {round.network.toUpperCase()}
                      </Badge>
                      {index === 0 && (
                        <Badge className="text-xs bg-red-500 text-white">
                          Latest
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(round.endTime)}</span>
                      </div>
                      
                      {round.winningTicketId && (
                        <div className="flex items-center space-x-1">
                          <span>Ticket #{round.winningTicketId.toString().padStart(3, '0')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right space-y-1">
                  <div className="flex items-center space-x-1 text-emerald-400 font-semibold">
                    <Coins className="w-4 h-4" />
                    <span>{round.prizeAmount} ETH</span>
                  </div>
                  
                  <div className="text-xs text-slate-400">
                    Winner: 0x1234...5678
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {pastRounds.length > 10 && (
          <div className="mt-4 text-center">
            <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
              View All History ({pastRounds.length} rounds)
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}