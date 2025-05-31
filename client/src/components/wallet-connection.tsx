import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWeb3 } from '@/hooks/use-web3';
import { Wallet, ChevronDown } from 'lucide-react';

interface WalletConnectionProps {
  selectedNetwork: string;
  onNetworkChange: (network: string) => void;
}

export function WalletConnection({ selectedNetwork, onNetworkChange }: WalletConnectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isConnected, address, balance, isConnecting, connectWallet, disconnect, switchNetwork } = useWeb3();

  const handleConnect = async (type: 'metamask' | 'trustwallet') => {
    await connectWallet(type);
    setIsModalOpen(false);
  };

  const handleNetworkChange = async (network: string) => {
    onNetworkChange(network);
    if (isConnected) {
      await switchNetwork(network);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="flex items-center space-x-4">
      {/* SCAI Network Badge */}
      <div className="hidden sm:block">
        <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-lg px-3 py-2">
          <div className="text-emerald-400 text-sm font-medium">
            🔗 SCAI Network
          </div>
        </div>
      </div>

      {/* Wallet Connection Button */}
      {isConnected ? (
        <div className="flex items-center space-x-3">
          {/* Wallet Info Card */}
          <div className="hidden sm:block bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2">
            <div className="text-xs text-slate-400 mb-1">Connected Wallet</div>
            <div className="text-sm font-mono text-white">
              {formatAddress(address!)}
            </div>
            <div className="text-xs text-emerald-400 mt-1">
              Balance: {balance ? `${parseFloat(balance).toFixed(4)} SCAI` : 'Loading...'}
            </div>
          </div>
          
          {/* Mobile version - compact */}
          <div className="sm:hidden bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2">
            <div className="text-xs font-mono text-white">
              {formatAddress(address!)}
            </div>
            <div className="text-xs text-emerald-400">
              {balance ? `${parseFloat(balance).toFixed(3)} SCAI` : '...'}
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={disconnect}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Disconnect
          </Button>
        </div>
      ) : (
        <Button 
          onClick={() => setIsModalOpen(true)}
          disabled={isConnecting}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium transition-all duration-200 transform hover:scale-105"
        >
          <Wallet className="w-4 h-4 mr-2" />
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      )}

      {/* Wallet Selection Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Connect Wallet</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3 mt-6">
            <Button
              onClick={() => handleConnect('metamask')}
              disabled={isConnecting}
              className="w-full bg-slate-700 hover:bg-slate-600 border border-slate-600 justify-start text-left p-4 h-auto"
            >
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <div>
                  <div className="font-medium">MetaMask</div>
                  <div className="text-sm text-slate-400">Connect using browser wallet</div>
                </div>
              </div>
            </Button>
            
            <Button
              onClick={() => handleConnect('trustwallet')}
              disabled={isConnecting}
              className="w-full bg-slate-700 hover:bg-slate-600 border border-slate-600 justify-start text-left p-4 h-auto"
            >
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <div>
                  <div className="font-medium">Trust Wallet</div>
                  <div className="text-sm text-slate-400">Connect using Trust Wallet</div>
                </div>
              </div>
            </Button>
          </div>
          
          <div className="mt-6 text-center text-sm text-slate-400">
            <p>By connecting a wallet, you agree to our Terms of Service</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
