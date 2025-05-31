import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { web3Service, type Web3Provider } from '@/lib/web3';
import { useToast } from '@/hooks/use-toast';

interface Web3ContextType {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  network: string | null;
  isConnecting: boolean;
  connectWallet: (type?: 'metamask' | 'trustwallet') => Promise<void>;
  switchNetwork: (network: string) => Promise<void>;
  disconnect: () => void;
}

const Web3Context = createContext<Web3ContextType | null>(null);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [web3State, setWeb3State] = useState<Web3Provider>({
    provider: null,
    signer: null,
    address: null,
    network: null,
    balance: null,
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const connectWallet = async (type: 'metamask' | 'trustwallet' = 'metamask') => {
    setIsConnecting(true);
    try {
      const result = await web3Service.connectWallet(type);
      setWeb3State(result);
      toast({
        title: "Wallet Connected",
        description: `Successfully connected ${type}`,
      });
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const switchNetwork = async (network: string) => {
    try {
      await web3Service.switchNetwork(network);
      
      // Refresh connection after network switch
      if (web3State.address) {
        const updatedState = await web3Service.connectWallet();
        setWeb3State(updatedState);
      }
      
      toast({
        title: "Network Switched",
        description: `Switched to ${network} network`,
      });
    } catch (error: any) {
      toast({
        title: "Network Switch Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const disconnect = () => {
    web3Service.disconnect();
    setWeb3State({
      provider: null,
      signer: null,
      address: null,
      network: null,
      balance: null,
    });
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  // Listen for account and network changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (accounts[0] !== web3State.address) {
        // Reconnect with new account
        connectWallet();
      }
    };

    const handleChainChanged = () => {
      // Refresh the connection when chain changes
      if (web3State.address) {
        connectWallet();
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [web3State.address]);

  // Try to reconnect on page load if previously connected
  useEffect(() => {
    const tryReconnect = async () => {
      if (window.ethereum && window.ethereum.selectedAddress) {
        try {
          await connectWallet();
        } catch (error) {
          // Silent fail on auto-reconnect
        }
      }
    };

    tryReconnect();
  }, []);

  const value: Web3ContextType = {
    isConnected: !!web3State.address,
    address: web3State.address,
    balance: web3State.balance,
    network: web3State.network,
    isConnecting,
    connectWallet,
    switchNetwork,
    disconnect,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}
