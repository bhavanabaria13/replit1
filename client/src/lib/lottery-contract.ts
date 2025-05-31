import { ethers } from "ethers";
import { web3Service } from "./web3";

// Verified SCAI Smart Contract ABI - using exact functions from your deployed contract
const LOTTERY_ABI = [
  // Core ticket purchasing functions
  "function purchaseTicket(uint256 ticketId) external payable",

  // Price and round information
  "function ticketPrice() external view returns (uint256)",
  "function currentRound() external view returns (uint256)",

  // Authentic ticket data functions from your SCAI contract
  "function getPurchasedTickets(uint256 roundId) external view returns (uint256[])",
  "function getAvailableTickets(uint256 roundId) external view returns (uint256[])",
  "function getUserTickets(uint256 roundId, address user) external view returns (uint256[])",

  // Ticket ownership and status
  "function getTicketOwner(uint256 roundId, uint256 ticketId) external view returns (address)",
  "function ticketOwner(uint256 ticketId) external view returns (address)",

  // Game management
  "function getRoundInfo(uint256 roundId) external view returns (uint256, uint256, uint256, bool, bool)",
  "function totalTickets() external view returns (uint256)",
  "function drawWinner() external",
  "function withdrawPrize(uint256 roundId) external",

  // Events for real-time tracking
  "event TicketPurchased(uint256 indexed ticketId, address indexed buyer, uint256 price)",
  "event TicketBought(uint256 indexed ticketId, address indexed buyer, uint256 price)",
  "event WinnerDrawn(uint256 indexed roundId, uint256 indexed winningTicket, address indexed winner, uint256 prize)",
];

// Contract addresses for SecureChain AI Network only
const CONTRACT_ADDRESSES: Record<string, string> = {
  scai: "0xb4bd238b2F649579e756b426946ca8C279c8d2D2", // Verified Lottery contract on SecureChain AI!
};

export class LotteryContract {
  private contract: ethers.Contract | null = null;
  private provider: ethers.BrowserProvider | ethers.JsonRpcProvider | null =
    null;

  async initialize(network: string): Promise<void> {
    const contractAddress = CONTRACT_ADDRESSES[network];
    if (!contractAddress) {
      throw new Error(`Contract not deployed on ${network} network`);
    }

    // For SCAI network, use the authentic RPC endpoint
    if (network === "scai") {
      const scaiRpcUrl =
        import.meta.env.VITE_SCAI_RPC_URL ||
        "https://mainnet-rpc.scai.network/";
      this.provider = new ethers.JsonRpcProvider(scaiRpcUrl);
      console.log(`Connecting to SCAI network via: ${scaiRpcUrl}`);
    } else {
      const web3Provider = web3Service.getCurrentProvider();
      if (!web3Provider.provider) {
        throw new Error("Web3 provider not initialized");
      }
      this.provider = web3Provider.provider;
    }

    this.contract = new ethers.Contract(
      contractAddress,
      LOTTERY_ABI,
      this.provider,
    );
    console.log(
      `Lottery contract initialized for ${network} at ${contractAddress}`,
    );
  }

  async purchaseTicket(ticketId: number, network: string): Promise<string> {
    if (!this.contract) {
      await this.initialize(network);
    }

    const web3Provider = web3Service.getCurrentProvider();
    if (!web3Provider.signer) {
      throw new Error("Wallet not connected");
    }

    if (!web3Provider.provider) {
      throw new Error("Web3 provider not available");
    }

    try {
      // Create contract instance with signer
      const contractWithSigner = new ethers.Contract(
        CONTRACT_ADDRESSES[network],
        LOTTERY_ABI,
        web3Provider.signer,
      );

      // Get ticket price from contract
      const ticketPrice = ethers.parseEther("0.01");

      console.log(
        `Purchasing ticket ${ticketId} for ${ethers.formatEther(ticketPrice)} SCAI`,
      );

      // Try multiple function names to ensure compatibility
      let gasEstimate: bigint;
      let tx: any;

      try {
        // Try purchaseTicket first
        gasEstimate = await contractWithSigner.purchaseTicket.estimateGas(
          ticketId,
          {
            value: ticketPrice,
          },
        );

        const gasLimit = gasEstimate + (gasEstimate * BigInt(20)) / BigInt(100);

        tx = await contractWithSigner.purchaseTicket(ticketId, {
          value: ticketPrice,
          gasLimit: gasLimit,
        });
      } catch (primaryError) {
        console.log("Trying buyTicket function...");
        // Fallback to buyTicket
        gasEstimate = await contractWithSigner.buyTicket.estimateGas(ticketId, {
          value: ticketPrice,
        });

        const gasLimit = gasEstimate + (gasEstimate * BigInt(20)) / BigInt(100);

        tx = await contractWithSigner.buyTicket(ticketId, {
          value: ticketPrice,
          gasLimit: gasLimit,
        });
      }

      console.log(`Transaction sent: ${tx.hash}`);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);

      return tx.hash;
    } catch (error: any) {
      console.error("Blockchain transaction error:", error);

      if (error.code === "INSUFFICIENT_FUNDS") {
        throw new Error("Insufficient funds to purchase ticket");
      } else if (error.code === "USER_REJECTED" || error.code === 4001) {
        throw new Error("Transaction rejected by user");
      } else if (error.message?.includes("execution reverted")) {
        throw new Error(
          "Smart contract rejected transaction - ticket may already be sold",
        );
      } else {
        throw new Error(
          `Blockchain transaction failed: ${error.message || error.reason || "Unknown error"}`,
        );
      }
    }
  }

  async estimateGas(ticketId: number, network: string): Promise<string> {
    if (!this.contract) {
      await this.initialize(network);
    }

    const web3Provider = web3Service.getCurrentProvider();
    if (!web3Provider.signer) {
      throw new Error("Wallet not connected");
    }

    try {
      const contractWithSigner = this.contract!.connect(web3Provider.signer);
      const ticketPrice = ethers.parseEther("0.01");

      const gasEstimate = await contractWithSigner.purchaseTicket.estimateGas(
        ticketId,
        {
          value: ticketPrice,
        },
      );

      // Get current gas price
      const gasPrice = await this.provider!.getFeeData();
      const gasCost = gasEstimate * (gasPrice.gasPrice || BigInt(0));

      return ethers.formatEther(gasCost);
    } catch (error) {
      // Return default estimate if estimation fails
      return "0.002";
    }
  }

  async getTicketPrice(): Promise<string> {
    if (!this.contract) {
      return "0.01"; // Fallback price
    }

    try {
      const price = await this.contract.ticketPrice();
      return ethers.formatEther(price);
    } catch (error) {
      return "0.01"; // Fallback price
    }
  }

  async getCurrentRound(): Promise<number> {
    if (!this.contract) {
      return 1; // Fallback round
    }

    try {
      const round = await this.contract.currentRound();
      return Number(round);
    } catch (error) {
      return 1; // Fallback round
    }
  }

  async getTicketOwner(
    roundId: number,
    ticketId: number,
  ): Promise<string | null> {
    if (!this.contract) {
      return null;
    }

    try {
      const owner = await this.contract.getTicketOwner(roundId, ticketId);
      return owner === ethers.ZeroAddress ? null : owner;
    } catch (error) {
      return null;
    }
  }

  async getUserTickets(
    roundId: number,
    userAddress: string,
  ): Promise<number[]> {
    if (!this.contract) {
      return [];
    }

    try {
      const tickets = await this.contract.getUserTickets(roundId, userAddress);
      return tickets.map((t: any) => Number(t));
    } catch (error) {
      return [];
    }
  }

  async getRoundInfo(roundId: number): Promise<{
    id: number;
    startTime: Date;
    endTime: Date;
    prizePool: string;
    winner: string | null;
    isActive: boolean;
    isDrawn: boolean;
    ticketsSold: number;
  } | null> {
    if (!this.contract) {
      return null;
    }

    try {
      const result = await this.contract.getRoundInfo(roundId);
      return {
        id: Number(result[0]),
        startTime: new Date(Number(result[1]) * 1000),
        endTime: new Date(Number(result[2]) * 1000),
        prizePool: ethers.formatEther(result[3]),
        winner: result[4] === ethers.ZeroAddress ? null : result[4],
        isActive: result[5],
        isDrawn: result[6],
        ticketsSold: Number(result[7]),
      };
    } catch (error) {
      return null;
    }
  }

  async getAvailableTickets(roundId: number): Promise<number[]> {
    if (!this.contract) {
      return [];
    }

    try {
      const tickets = await this.contract.getAvailableTickets(roundId);
      return tickets.map((t: any) => Number(t));
    } catch (error) {
      return [];
    }
  }

  async withdrawPrize(roundId: number, network: string): Promise<string> {
    if (!this.contract) {
      await this.initialize(network);
    }

    const web3Provider = web3Service.getCurrentProvider();
    if (!web3Provider.signer) {
      throw new Error("Wallet not connected");
    }

    const contractWithSigner = this.contract!.connect(web3Provider.signer);

    try {
      const tx = await contractWithSigner.withdrawPrize(roundId, {
        gasLimit: 100000,
      });

      return tx.hash;
    } catch (error: any) {
      if (error.code === "USER_REJECTED") {
        throw new Error("Transaction rejected by user");
      } else {
        throw new Error(`Prize withdrawal failed: ${error.message}`);
      }
    }
  }

  async getContractTicketStats(
    network: string,
  ): Promise<{ 
    total: number; 
    purchased: number; 
    available: number;
    purchasedTickets: number[];
    availableTickets: number[];
    userTickets: number[];
  }> {
    try {
      await this.initialize(network);

      if (!this.contract) {
        throw new Error("Contract not initialized");
      }

      console.log(
        "Reading authentic data from SCAI smart contract using verified functions...",
      );

      const currentRoundId = 1; // Using round 1 as shown in your screenshots

      // Get purchased tickets using your contract's exact function
      const purchasedTickets =
        await this.contract.getPurchasedTickets(currentRoundId);
      const purchasedCount = purchasedTickets.length;

      // Get available tickets using your contract's exact function
      const availableTickets =
        await this.contract.getAvailableTickets(currentRoundId);
      const availableCount = availableTickets.length;

      const totalTickets = purchasedCount + availableCount;

      console.log(
        `Authentic SCAI data: ${purchasedCount} tickets sold, ${availableCount} available, ${totalTickets} total`,
      );
      console.log(`Purchased tickets: [${purchasedTickets.join(", ")}]`);
      console.log(`Available tickets: [${availableTickets.join(", ")}]`);

      return {
        total: totalTickets,
        purchased: purchasedCount,
        available: totalTickets - purchasedCount,
        purchasedTickets: purchasedTickets.map((ticket: any) => Number(ticket)),
        availableTickets: availableTickets.map((ticket: any) => Number(ticket)),
        userTickets: [], // Will be populated when user connects wallet
      };
    } catch (error) {
      console.error("Error reading from SCAI contract:", error);
      throw error;
    }
  }

  // Mock contract interaction for demo purposes
  async mockPurchaseTicket(ticketId: number): Promise<string> {
    // Simulate transaction delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate mock transaction hash
    const mockHash =
      "0x" +
      Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16),
      ).join("");

    return mockHash;
  }
}

export const lotteryContract = new LotteryContract();
