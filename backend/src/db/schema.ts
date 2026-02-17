import {
  pgTable,
  text,
  serial,
  integer,
  timestamp,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const cardStatusEnum = pgEnum("card_status", [
  "ACTIVE",
  "FROZEN",
  "TERMINATED",
]);
export const transactionStatusEnum = pgEnum("transaction_status", [
  "PENDING",
  "COMPLETED",
  "DECLINED",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cards = pgTable("cards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  name: text("name").notNull(), // e.g. "AWS Subscription"
  last4: text("last4").notNull(),
  status: cardStatusEnum("status").default("ACTIVE").notNull(),
  limitAmount: integer("limit_amount").notNull(), // in cents
  spentAmount: integer("spent_amount").default(0).notNull(), // in cents
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  cardId: integer("card_id")
    .references(() => cards.id)
    .notNull(),
  merchantName: text("merchant_name").notNull(),
  amount: integer("amount").notNull(), // in cents
  date: timestamp("date").defaultNow().notNull(),
  status: transactionStatusEnum("status").default("COMPLETED").notNull(),
  receiptUrl: text("receipt_url"),
});

export const usersRelations = relations(users, ({ many }) => ({
  cards: many(cards),
}));

export const cardsRelations = relations(cards, ({ one, many }) => ({
  user: one(users, {
    fields: [cards.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  card: one(cards, {
    fields: [transactions.cardId],
    references: [cards.id],
  }),
}));
