import { 
  lotteryRounds, 
  tickets, 
  transactions, 
  users,
  type LotteryRound, 
  type InsertLotteryRound,
  type Ticket, 
  type InsertTicket,
  type Transaction, 
  type InsertTransaction,
  type User, 
  type InsertUser 
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // Lottery rounds
  getCurrentRound(network: string): Promise<LotteryRound | undefined>;
  getPastRounds(network: string, limit?: number): Promise<LotteryRound[]>;
  createRound(round: InsertLotteryRound): Promise<LotteryRound>;
  updateRound(id: number, updates: Partial<LotteryRound>): Promise<LotteryRound | undefined>;
  
  // Tickets
  getTicketsByRound(roundId: number): Promise<Ticket[]>;
  getAvailableTickets(roundId: number): Promise<Ticket[]>;
  getPurchasedTickets(roundId: number): Promise<Ticket[]>;
  purchaseTicket(ticketId: number, purchaserAddress: string, transactionHash: string): Promise<Ticket | undefined>;
  createTicketsForRound(roundId: number): Promise<Ticket[]>;
  getTicket(id: number): Promise<Ticket | undefined>;
  getUserTickets(userAddress: string): Promise<Ticket[]>;
  
  // Transactions
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userAddress: string): Promise<Transaction[]>;
  updateTransactionStatus(id: number, status: string): Promise<Transaction | undefined>;
  
  // Users
  getUser(address: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(address: string, updates: Partial<User>): Promise<User | undefined>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize with a current round for each network
    this.initializeCurrentRounds();
  }

  private async initializeCurrentRounds() {
    try {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);

      // Create rounds for both networks if they don't exist
      for (const network of ['sepolia', 'scai']) {
        const existingRound = await this.getCurrentRound(network);
        if (!existingRound) {
          // Get the highest round number for this network
          const lastRound = await db.select()
            .from(lotteryRounds)
            .where(eq(lotteryRounds.network, network))
            .orderBy(desc(lotteryRounds.roundNumber))
            .limit(1);
          
          const nextRoundNumber = lastRound.length > 0 ? lastRound[0].roundNumber + 1 : 1;
          
          const round = await this.createRound({
            roundNumber: nextRoundNumber,
            startTime: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Started yesterday
            endTime: endOfDay,
            prizeAmount: "0.1",
            network,
            isActive: true,
            isDrawn: false,
          });
          
          await this.createTicketsForRound(round.id);
        }
      }
    } catch (error) {
      console.log('Database initialization completed or already exists');
    }
  }

  async getCurrentRound(network: string): Promise<LotteryRound | undefined> {
    const result = await db.select()
      .from(lotteryRounds)
      .where(and(
        eq(lotteryRounds.network, network),
        eq(lotteryRounds.isActive, true),
        eq(lotteryRounds.isDrawn, false)
      ))
      .limit(1);
    
    return result[0];
  }

  async getPastRounds(network: string, limit: number = 20): Promise<LotteryRound[]> {
    return await db.select()
      .from(lotteryRounds)
      .where(and(
        eq(lotteryRounds.network, network),
        eq(lotteryRounds.isDrawn, true)
      ))
      .orderBy(desc(lotteryRounds.endTime))
      .limit(limit);
  }

  async createRound(insertRound: InsertLotteryRound): Promise<LotteryRound> {
    const result = await db.insert(lotteryRounds)
      .values(insertRound)
      .returning();
    
    return result[0];
  }

  async updateRound(id: number, updates: Partial<LotteryRound>): Promise<LotteryRound | undefined> {
    const result = await db.update(lotteryRounds)
      .set(updates)
      .where(eq(lotteryRounds.id, id))
      .returning();
    
    return result[0];
  }

  async getTicketsByRound(roundId: number): Promise<Ticket[]> {
    return await db.select()
      .from(tickets)
      .where(eq(tickets.roundId, roundId));
  }

  async getAvailableTickets(roundId: number): Promise<Ticket[]> {
    return await db.select()
      .from(tickets)
      .where(and(
        eq(tickets.roundId, roundId),
        eq(tickets.isAvailable, true)
      ));
  }

  async getPurchasedTickets(roundId: number): Promise<Ticket[]> {
    return await db.select()
      .from(tickets)
      .where(and(
        eq(tickets.roundId, roundId),
        eq(tickets.isAvailable, false)
      ));
  }

  async purchaseTicket(ticketId: number, purchaserAddress: string, transactionHash: string): Promise<Ticket | undefined> {
    const result = await db.update(tickets)
      .set({
        purchaserAddress,
        purchasePrice: "0.01",
        transactionHash,
        purchasedAt: new Date(),
        isAvailable: false,
      })
      .where(and(
        eq(tickets.id, ticketId),
        eq(tickets.isAvailable, true)
      ))
      .returning();
    
    return result[0];
  }

  async createTicketsForRound(roundId: number): Promise<Ticket[]> {
    const ticketData = [];
    
    for (let i = 1; i <= 50; i++) {
      const ticketNumber = this.generateTicketNumber();
      ticketData.push({
        roundId,
        ticketNumber,
        ticketIndex: i,
        purchaserAddress: null,
        purchasePrice: null,
        transactionHash: null,
        purchasedAt: null,
        isAvailable: true,
      });
    }
    
    const result = await db.insert(tickets)
      .values(ticketData)
      .returning();
    
    return result;
  }

  private generateTicketNumber(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async getTicket(id: number): Promise<Ticket | undefined> {
    const result = await db.select()
      .from(tickets)
      .where(eq(tickets.id, id))
      .limit(1);
    
    return result[0];
  }

  async getUserTickets(userAddress: string): Promise<Ticket[]> {
    return await db.select()
      .from(tickets)
      .where(eq(tickets.purchaserAddress, userAddress));
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const result = await db.insert(transactions)
      .values(insertTransaction)
      .returning();
    
    return result[0];
  }

  async getUserTransactions(userAddress: string): Promise<Transaction[]> {
    return await db.select()
      .from(transactions)
      .where(eq(transactions.userAddress, userAddress))
      .orderBy(desc(transactions.createdAt));
  }

  async updateTransactionStatus(id: number, status: string): Promise<Transaction | undefined> {
    const result = await db.update(transactions)
      .set({ status })
      .where(eq(transactions.id, id))
      .returning();
    
    return result[0];
  }

  async getUser(address: string): Promise<User | undefined> {
    const result = await db.select()
      .from(users)
      .where(eq(users.address, address))
      .limit(1);
    
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users)
      .values(insertUser)
      .returning();
    
    return result[0];
  }

  async updateUser(address: string, updates: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users)
      .set(updates)
      .where(eq(users.address, address))
      .returning();
    
    return result[0];
  }
}

export const storage = new DatabaseStorage();
