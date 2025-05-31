import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const lotteryRounds = pgTable("lottery_rounds", {
  id: serial("id").primaryKey(),
  roundNumber: integer("round_number").notNull().unique(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  winningTicketId: integer("winning_ticket_id"),
  prizeAmount: decimal("prize_amount", { precision: 18, scale: 8 }).notNull(),
  network: text("network").notNull(), // 'sepolia' or 'scai'
  isActive: boolean("is_active").notNull().default(true),
  isDrawn: boolean("is_drawn").notNull().default(false),
});

export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  roundId: integer("round_id").notNull(),
  ticketNumber: text("ticket_number").notNull(), // e.g., "ABC123"
  ticketIndex: integer("ticket_index").notNull(), // 1-50
  purchaserAddress: text("purchaser_address"),
  purchasePrice: decimal("purchase_price", { precision: 18, scale: 8 }),
  transactionHash: text("transaction_hash"),
  purchasedAt: timestamp("purchased_at"),
  isAvailable: boolean("is_available").notNull().default(true),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userAddress: text("user_address").notNull(),
  type: text("type").notNull(), // 'purchase', 'win'
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  ticketId: integer("ticket_id"),
  transactionHash: text("transaction_hash").notNull(),
  network: text("network").notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'confirmed', 'failed'
  createdAt: timestamp("created_at").notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  address: text("address").notNull().unique(),
  totalSpent: decimal("total_spent", { precision: 18, scale: 8 }).notNull().default("0"),
  totalWon: decimal("total_won", { precision: 18, scale: 8 }).notNull().default("0"),
  ticketsPurchased: integer("tickets_purchased").notNull().default(0),
  lastActive: timestamp("last_active"),
});

// Insert schemas
export const insertLotteryRoundSchema = createInsertSchema(lotteryRounds).omit({
  id: true,
});

export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// Types
export type LotteryRound = typeof lotteryRounds.$inferSelect;
export type InsertLotteryRound = z.infer<typeof insertLotteryRoundSchema>;

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
