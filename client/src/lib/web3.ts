import { ethers } from "ethers";

export interface Web3Provider {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  address: string | null;
  network: string | null;
  balance: string | null;
}

export interface NetworkConfig {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

export const SUPPORTED_NETWORKS: Record<string, NetworkConfig> = {
  scai: {
    chainId: "34", // 0x2710 for SCAI network
    chainName: "SecureChain AI Network",
    nativeCurrency: {
      name: "SCAI",
      symbol: "SCAI",
      decimals: 18,
    },
    rpcUrls: [
      import.meta.env.VITE_SCAI_RPC_URL || "https://mainnet-rpc.scai.network/",
    ],
    blockExplorerUrls: ["https://explorer.securechain.ai/"],
  },
};

export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  async connectWallet(
    walletType: "metamask" | "trustwallet" = "metamask",
  ): Promise<Web3Provider> {
    if (!window.ethereum) {
      throw new Error(
        "No Web3 wallet detected. Please install MetaMask or Trust Wallet.",
      );
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found. Please unlock your wallet.");
      }

      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();

      const address = await this.signer.getAddress();
      const network = await this.provider.getNetwork();
      const balance = await this.provider.getBalance(address);

      return {
        provider: this.provider,
        signer: this.signer,
        address,
        network: network.name,
        balance: ethers.formatEther(balance),
      };
    } catch (error: any) {
      throw new Error(`Failed to connect wallet: ${error.message}`);
    }
  }

  async switchNetwork(networkKey: string): Promise<void> {
    if (!window.ethereum) {
      throw new Error("No Web3 wallet detected");
    }

    const networkConfig = SUPPORTED_NETWORKS[networkKey];
    if (!networkConfig) {
      throw new Error("Unsupported network");
    }

    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: networkConfig.chainId }],
      });
    } catch (switchError: any) {
      // If the network is not added to the wallet, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [networkConfig],
          });
        } catch (addError: any) {
          throw new Error(`Failed to add network: ${addError.message}`);
        }
      } else {
        throw new Error(`Failed to switch network: ${switchError.message}`);
      }
    }
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) {
      throw new Error("Provider not initialized");
    }

    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  async sendTransaction(to: string, value: string): Promise<string> {
    if (!this.signer) {
      throw new Error("Signer not initialized");
    }

    const tx = await this.signer.sendTransaction({
      to,
      value: ethers.parseEther(value),
    });

    return tx.hash;
  }

  async waitForTransaction(
    hash: string,
  ): Promise<ethers.TransactionReceipt | null> {
    if (!this.provider) {
      throw new Error("Provider not initialized");
    }

    return await this.provider.waitForTransaction(hash);
  }

  disconnect(): void {
    this.provider = null;
    this.signer = null;
  }

  isConnected(): boolean {
    return this.provider !== null && this.signer !== null;
  }

  getCurrentProvider(): Web3Provider {
    return {
      provider: this.provider,
      signer: this.signer,
      address: null,
      network: null,
      balance: null,
    };
  }
}

// Global instance
export const web3Service = new Web3Service();

// Type augmentation for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
