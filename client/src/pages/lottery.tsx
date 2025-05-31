import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { WalletConnection } from "@/components/wallet-connection";
import { TicketGrid } from "@/components/ticket-grid";
import { UserDashboard } from "@/components/user-dashboard";
import { PurchaseModal } from "@/components/purchase-modal";
import { CountdownTimer } from "@/components/countdown-timer";
import { WinnerHistory } from "@/components/winner-history";
import { LotteryStatsChart } from "@/components/lottery-stats-chart";
import { LotteryBannerSlider } from "@/components/lottery-banner-slider";
import { useConfetti } from "@/components/confetti-effect";
import {
  useLotteryData,
  useCountdown,
  useLotteryHistory,
  usePurchasedTicketsCount,
  useContractTicketData,
} from "@/hooks/use-lottery";
import { useWeb3 } from "@/hooks/use-web3";
import { useToast } from "@/hooks/use-toast";
import { Dices, Trophy, Ticket, Clock } from "lucide-react";
import type { Ticket as TicketType } from "@shared/schema";

export default function LotteryPage() {
  const selectedNetwork = "scai"; // SCAI network only
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const { triggerConfetti, ConfettiComponent } = useConfetti();
  const [countdown, setCountdown] = useState({
    hours: 23,
    minutes: 45,
    seconds: 12,
  });

  const { isConnected, address } = useWeb3();
  const {
    data: lotteryData,
    isLoading,
    refetch,
  } = useLotteryData(selectedNetwork);
  const { data: lotteryHistory, isLoading: historyLoading } =
    useLotteryHistory(selectedNetwork);
  const { data: purchasedTicketsData } =
    usePurchasedTicketsCount(selectedNetwork);
  const { data: contractData, isLoading: contractLoading } =
    useContractTicketData(selectedNetwork);
  const { toast } = useToast();

  // Update countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);

      const timeDiff = endOfDay.getTime() - now.getTime();
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      setCountdown({
        hours: Math.max(0, hours),
        minutes: Math.max(0, minutes),
        seconds: Math.max(0, seconds),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleTicketSelect = (ticket: TicketType) => {
    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to purchase tickets",
        variant: "destructive",
      });
      return;
    }

    setSelectedTicket(ticket);
    setIsPurchaseModalOpen(true);
  };

  const handleClosePurchaseModal = () => {
    setIsPurchaseModalOpen(false);
    setSelectedTicket(null);
  };

  const formatCountdown = () => {
    const { hours, minutes, seconds } = countdown;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const stats = {
    totalTickets: contractData?.total || 50,
    soldTickets: contractData?.purchased || purchasedTicketsData?.count || 0,
    availableTickets:
      contractData?.available || 50 - (purchasedTicketsData?.count || 0),
    prizePool: "0.1",
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Professional Header */}
      <header className="glass-card border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 gradient-bg-primary rounded-2xl flex items-center justify-center glow-green">
                  <Dices className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold heading-gradient">
                    CryptoLotto
                  </h1>
                  <p className="text-xs text-slate-400 font-medium">
                    Decentralized Lottery
                  </p>
                </div>
              </div>
            </div>

            <WalletConnection
              selectedNetwork={selectedNetwork}
              onNetworkChange={() => {}} // No network switching needed - SCAI only
            />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-emerald-500/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Banner Slider */}
          <LotteryBannerSlider />

          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              Daily Crypto Lottery
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Purchase lottery tickets for 0.01 SCAI and win amazing prizes on
              SecureChain AI Network!
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-slate-800/80 backdrop-blur-md border-slate-700/50 text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-emerald-400 mb-2">
                  {stats.prizePool}
                </div>
                <div className="text-slate-400">Prize Pool (SCAI)</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/80 backdrop-blur-md border-slate-700/50 text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-indigo-400 mb-2">
                  {stats.soldTickets}
                </div>
                <div className="text-slate-400">Tickets Sold</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/80 backdrop-blur-md border-slate-700/50 text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  {stats.availableTickets}
                </div>
                <div className="text-slate-400">Available</div>
              </CardContent>
            </Card>
          </div>

          {/* Countdown Timer */}
          <div className="max-w-md mx-auto mb-12">
            <CountdownTimer
              endTime={
                lotteryData?.round?.endTime
                  ? new Date(lotteryData.round.endTime)
                  : new Date(Date.now() + 24 * 60 * 60 * 1000)
              }
              onTimeExpired={() => {
                toast({
                  title: "🎉 Lottery Draw Complete!",
                  description:
                    "The winner has been selected! Check back for the next round.",
                });
                refetch();
              }}
            />
          </div>
        </div>
      </section>

      {/* Ticket Grid */}
      <section className="py-12 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TicketGrid
            tickets={lotteryData?.tickets || []}
            userAddress={address}
            onTicketSelect={handleTicketSelect}
            isLoading={isLoading}
            onRefresh={() => refetch()}
            contractData={{
              purchasedTickets: contractData?.purchasedTickets || [],
              userTickets: contractData?.userTickets || [],
              availableTickets: contractData?.availableTickets || [],
            }}
          />
        </div>
      </section>

      {/* Lottery Statistics Chart */}
      <section className="py-12 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Lottery Statistics
            </h2>
            <p className="text-slate-400">
              Visual overview of ticket distribution and participation
            </p>
          </div>
          <LotteryStatsChart
            tickets={lotteryData?.tickets || []}
            userAddress={address}
            contractData={contractData}
          />
        </div>
      </section>

      {/* User Dashboard */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <UserDashboard userAddress={address} />
        </div>
      </section>

      {/* Winner History */}
      <section className="py-12 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <WinnerHistory
            pastRounds={lotteryHistory || []}
            isLoading={historyLoading}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 border-t border-slate-700/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-bold mb-4 text-indigo-400">How It Works</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>• 50 tickets generated daily</li>
                <li>• Purchase tickets for 0.01 SCAI</li>
                <li>• Winner selected at midnight UTC</li>
                <li>• Prize: 0.1 SCAI automatically sent</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-purple-400">
                Supported Networks
              </h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>• SCAI Network</li>
                <li>
                  • SCAI Contract:{" "}
                  <a
                    href="https://explorer.securechain.ai/address/0xb4bd238b2F649579e756b426946ca8C279c8d2D2?tab=contract"
                    target="_blank"
                  >
                    0xb4b....8d2D2
                  </a>
                </li>
                <li>• More networks coming soon</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-emerald-400">Security</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>• Provably fair random selection</li>
                <li>• Smart contract verified</li>
                <li>• Non-custodial lottery system</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-700/50 mt-8 pt-8 text-center text-sm text-slate-400">
            <p>
              © {new Date().getFullYear()} CryptoLotto. Decentralized lottery
              platform.
            </p>
          </div>
        </div>
      </footer>

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={handleClosePurchaseModal}
        ticket={selectedTicket}
        network={selectedNetwork}
        onPurchaseSuccess={triggerConfetti}
      />

      {/* Confetti Effect */}
      <ConfettiComponent />
    </div>
  );
}
