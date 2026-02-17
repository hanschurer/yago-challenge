import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./db";
import { cards, transactions, users, cardStatusEnum } from "./db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Validation schemas
const createCardSchema = z.object({
  name: z.string().min(1, "Name is required"),
  limitAmount: z.number().min(100, "Limit must be at least 100 cents (1 USD)"),
});

const updateCardSchema = z.object({
  status: z.enum(["ACTIVE", "FROZEN", "TERMINATED"]).optional(),
  limitAmount: z.number().min(1).optional(),
});

// Routes

// Get all cards
app.get("/api/cards", async (req, res) => {
  try {
    const allCards = await db
      .select()
      .from(cards)
      .orderBy(desc(cards.createdAt));
    res.json(allCards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch cards" });
  }
});

// Create a new card
app.post("/api/cards", async (req, res) => {
  try {
    const { name, limitAmount } = createCardSchema.parse(req.body);

    // Mock User ID
    const userId = 1;

    // Generate Mock Card Number
    const last4 = Math.floor(1000 + Math.random() * 9000).toString();

    const [newCard] = await db
      .insert(cards)
      .values({
        userId,
        name,
        last4,
        limitAmount,
        status: "ACTIVE",
      })
      .returning();

    res.status(201).json(newCard);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error(error);
      res.status(500).json({ error: "Failed to create card" });
    }
  }
});

// Update card (freeze/terminate/limit)
app.patch("/api/cards/:id", async (req, res) => {
  try {
    // Correctly parse the id from params
    const cardId = parseInt(req.params.id);
    if (isNaN(cardId)) {
      return res.status(400).json({ error: "Invalid card ID" });
    }

    const { status, limitAmount } = updateCardSchema.parse(req.body);

    const updateData: any = {};
    if (status) updateData.status = status;
    if (limitAmount) updateData.limitAmount = limitAmount;

    const [updatedCard] = await db
      .update(cards)
      .set(updateData)
      .where(eq(cards.id, cardId))
      .returning();

    if (!updatedCard) {
      return res.status(404).json({ error: "Card not found" });
    }

    res.json(updatedCard);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error(error);
      res.status(500).json({ error: "Failed to update card" });
    }
  }
});

// Get transactions (optionally by cardId)
app.get("/api/transactions", async (req, res) => {
  try {
    const cardId = req.query.cardId
      ? parseInt(req.query.cardId as string)
      : undefined;

    let query = db.select().from(transactions).orderBy(desc(transactions.date));

    if (cardId) {
      query = query.where(eq(transactions.cardId, cardId)) as any;
    }

    const result = await query;
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// Simulate a transaction (for demo purposes)
app.post("/api/simulate-transaction", async (req, res) => {
  try {
    const { cardId, amount, merchantName } = req.body;

    // Check card
    const [card] = await db.select().from(cards).where(eq(cards.id, cardId));
    if (!card) return res.status(404).json({ error: "Card not found" });

    if (card.status !== "ACTIVE") {
      return res.status(400).json({ error: "Card is not active" });
    }

    if (card.spentAmount + amount > card.limitAmount) {
      // Log failed transaction?
      await db.insert(transactions).values({
        cardId,
        merchantName,
        amount,
        status: "DECLINED",
      });
      return res
        .status(400)
        .json({ error: "Transaction declined: Limit exceeded" });
    }

    // Process transaction
    const [transaction] = await db
      .insert(transactions)
      .values({
        cardId,
        merchantName,
        amount,
        status: "COMPLETED",
      })
      .returning();

    // Update card balance
    await db
      .update(cards)
      .set({ spentAmount: card.spentAmount + amount })
      .where(eq(cards.id, cardId));

    res.json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to process transaction" });
  }
});

// Seed DB endpoint
app.post("/api/seed", async (req, res) => {
  try {
    // Create user if not exists
    const [existingUser] = await db.select().from(users).limit(1);
    let userId = existingUser?.id;

    if (!userId) {
      const [newUser] = await db
        .insert(users)
        .values({
          name: "Demo Client",
          email: "client@privacy.com",
        })
        .returning();
      userId = newUser.id;
    }

    // Create some cards
    const [card1] = await db
      .insert(cards)
      .values({
        userId,
        name: "AWS Subscription",
        last4: "4242",
        limitAmount: 50000,
        status: "ACTIVE",
      })
      .returning();

    const [card2] = await db
      .insert(cards)
      .values({
        userId,
        name: "Team Lunch",
        last4: "1234",
        limitAmount: 20000,
        status: "ACTIVE",
      })
      .returning();

    // Create transactions
    await db.insert(transactions).values([
      { cardId: card1.id, merchantName: "AWS Services", amount: 1250 },
      { cardId: card1.id, merchantName: "AWS Services", amount: 4500 },
      { cardId: card2.id, merchantName: "Uber Eats", amount: 3500 },
    ]);

    res.json({ message: "Seeded successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to seed" });
  }
});

app.get("/", (req, res) => {
  res.send("Fintech API Running");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
