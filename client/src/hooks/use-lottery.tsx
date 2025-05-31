import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { lotteryContract } from '@/lib/lottery-contract';
import { useWeb3 } from './use-web3';
import { useToast } from './use-toast';

export function useLotteryData(network: string) {
  return useQuery({
    queryKey: [`/api/lottery/current/${network}`],
    enabled: !!network,
  });
}

export function usePurchasedTicketsCount(network: string) {
  return useQuery({
    queryKey: [`/api/lottery/purchased/${network}`],
    enabled: !!network,
  });
}

export function useContractTicketData(network: string) {
  return useQuery({
    queryKey: [`contract-tickets`, network],
    queryFn: async () => {
      if (network === 'scai') {
        try {
          return await lotteryContract.getContractTicketStats(network);
        } catch (error) {
          console.log('Using database fallback for ticket stats');
          return { 
            total: 50, 
            purchased: 0, 
            available: 50,
            purchasedTickets: [],
            availableTickets: [],
            userTickets: []
          };
        }
      }
      return { 
        total: 50, 
        purchased: 0, 
        available: 50,
        purchasedTickets: [],
        availableTickets: [],
        userTickets: []
      };
    },
    enabled: !!network,
    refetchInterval: 60000, // Refresh every 60 seconds instead of 15
    staleTime: 30000, // Consider data fresh for 30 seconds
    retry: 2,
  });
}

export function useUserTickets(address: string | null) {
  return useQuery({
    queryKey: [`/api/user/${address}/tickets`],
    enabled: !!address,
  });
}

export function useUserTransactions(address: string | null) {
  return useQuery({
    queryKey: [`/api/user/${address}/transactions`],
    enabled: !!address,
  });
}

export function useUserProfile(address: string | null) {
  return useQuery({
    queryKey: [`/api/user/${address}`],
    enabled: !!address,
  });
}

export function useLotteryHistory(network: string) {
  return useQuery({
    queryKey: [`/api/lottery/history/${network}`],
    enabled: !!network,
  });
}

export function usePurchaseTicket() {
  const queryClient = useQueryClient();
  const { address } = useWeb3();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      ticketId, 
      network 
    }: { 
      ticketId: number; 
      network: string; 
    }) => {
      if (!address) {
        throw new Error('Wallet not connected');
      }

      // For demo purposes, use mock transaction
      // Real blockchain transaction to your Sepolia smart contract
      const txHash = await lotteryContract.purchaseTicket(ticketId, network);

      // Record the purchase in our backend
      const response = await apiRequest('POST', '/api/lottery/purchase', {
        ticketId,
        userAddress: address,
        transactionHash: txHash,
        network,
      });

      return await response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Ticket Purchased!",
        description: `Successfully purchased ticket #${variables.ticketId}`,
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [`/api/lottery/current/${variables.network}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/user/${address}/tickets`] });
      queryClient.invalidateQueries({ queryKey: [`/api/user/${address}/transactions`] });
      queryClient.invalidateQueries({ queryKey: [`/api/user/${address}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to purchase ticket",
        variant: "destructive",
      });
    },
  });
}

export function useEstimateGas() {
  return useMutation({
    mutationFn: async ({ ticketId, network }: { ticketId: number; network: string }) => {
      return await lotteryContract.estimateGas(ticketId, network);
    },
  });
}

// Hook for countdown timer
export function useCountdown() {
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  
  const timeDiff = endOfDay.getTime() - now.getTime();
  const hours = Math.floor(timeDiff / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

  return {
    hours: Math.max(0, hours),
    minutes: Math.max(0, minutes),
    seconds: Math.max(0, seconds),
    timeString: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
  };
}
