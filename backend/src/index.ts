import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { EventEmitter } from "events";
import { db } from "./db";
import { cards, transactions, users, cardStatusEnum } from "./db/schema";
import { eq, desc, gt } from "drizzle-orm";
import { z } from "zod";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Event Emitter for Real-time updates
const eventBus = new EventEmitter();

// Simulation State
let simulationInterval: NodeJS.Timeout | null = null;

// Directory for generated large files
const FILES_DIR = path.resolve(__dirname, "../uploads");
if (!fs.existsSync(FILES_DIR)) {
  fs.mkdirSync(FILES_DIR, { recursive: true });
}

app.use(
  cors({
    exposedHeaders: [
      "Content-Range",
      "Accept-Ranges",
      "Content-Length",
      "X-File-Hash",
    ],
  }),
);
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

// ==========================================
// Large File Resumable Download Endpoints
// ==========================================

// Generate a large test file
app.post("/api/files/generate", async (req, res) => {
  try {
    const { sizeMB = 100, filename } = req.body;
    const safeName = filename || `testfile_${sizeMB}MB_${Date.now()}.bin`;
    const filePath = path.join(FILES_DIR, safeName);

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      const hash = await computeFileHash(filePath);
      return res.json({
        filename: safeName,
        size: stat.size,
        hash,
        message: "File already exists",
      });
    }

    const totalBytes = sizeMB * 1024 * 1024;
    const chunkSize = 1024 * 1024; // Write 1MB at a time
    const writeStream = fs.createWriteStream(filePath);

    let written = 0;
    const writeChunk = () => {
      while (written < totalBytes) {
        const remaining = totalBytes - written;
        const size = Math.min(chunkSize, remaining);
        const buf = crypto.randomBytes(size);
        const canContinue = writeStream.write(buf);
        written += size;
        if (!canContinue) {
          writeStream.once("drain", writeChunk);
          return;
        }
      }
      writeStream.end();
    };

    writeChunk();

    writeStream.on("finish", async () => {
      const hash = await computeFileHash(filePath);
      res.json({
        filename: safeName,
        size: totalBytes,
        hash,
        message: "File generated successfully",
      });
    });

    writeStream.on("error", (err) => {
      console.error("File write error:", err);
      res.status(500).json({ error: "Failed to generate file" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate file" });
  }
});

// Get file info (size + hash)
app.get("/api/files/:filename/info", async (req, res) => {
  try {
    const filePath = path.join(FILES_DIR, req.params.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }
    const stat = fs.statSync(filePath);
    const hash = await computeFileHash(filePath);
    res.json({
      filename: req.params.filename,
      size: stat.size,
      hash,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get file info" });
  }
});

// List available files
app.get("/api/files", (req, res) => {
  try {
    if (!fs.existsSync(FILES_DIR)) {
      return res.json([]);
    }
    const files = fs.readdirSync(FILES_DIR).map((name) => {
      const stat = fs.statSync(path.join(FILES_DIR, name));
      return { filename: name, size: stat.size, createdAt: stat.birthtime };
    });
    res.json(files);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to list files" });
  }
});

// Download file with Range support (resumable download)
app.get("/api/files/:filename", (req, res) => {
  try {
    const filePath = path.join(FILES_DIR, req.params.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;

    // Always advertise Range support
    res.setHeader("Accept-Ranges", "bytes");

    const rangeHeader = req.headers.range;

    if (rangeHeader) {
      // Parse Range header: "bytes=start-end"
      const parts = rangeHeader.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      // Validate range
      if (start >= fileSize || end >= fileSize || start > end) {
        res.status(416).setHeader("Content-Range", `bytes */${fileSize}`);
        return res.end();
      }

      const chunkSize = end - start + 1;

      res.status(206);
      res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`);
      res.setHeader("Content-Length", chunkSize);
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${req.params.filename}"`,
      );

      const stream = fs.createReadStream(filePath, { start, end });
      stream.pipe(res);
    } else {
      // Full file download
      res.setHeader("Content-Length", fileSize);
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${req.params.filename}"`,
      );

      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to download file" });
  }
});

// Helper: compute SHA-256 hash of a file
function computeFileHash(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
}

// ==========================================
// Real-time Simulation & SSE Endpoints
// ==========================================

// Helper to simulate a transaction
const createRandomTransaction = async () => {
  try {
    // Pick a random card
    const allCards = await db
      .select()
      .from(cards)
      .where(eq(cards.status, "ACTIVE"));
    if (allCards.length === 0) return;

    const randomCard = allCards[Math.floor(Math.random() * allCards.length)];
    const amount = Math.floor(Math.random() * 5000) + 100; // 1.00 to 50.00
    const merchants = [
      "Uber",
      "Netflix",
      "Amazon",
      "Starbucks",
      "Spotify",
      "Apple",
      "Google Cloud",
    ];
    const merchantName =
      merchants[Math.floor(Math.random() * merchants.length)];

    // Check limit
    if (randomCard.spentAmount + amount > randomCard.limitAmount) {
      await db.insert(transactions).values({
        cardId: randomCard.id,
        merchantName,
        amount,
        status: "DECLINED",
      });
      // Emit even for declined (optional)
      return;
    }

    const [newTx] = await db
      .insert(transactions)
      .values({
        cardId: randomCard.id,
        merchantName,
        amount,
        status: "COMPLETED",
      })
      .returning();

    // Update balance
    await db
      .update(cards)
      .set({ spentAmount: randomCard.spentAmount + amount })
      .where(eq(cards.id, randomCard.id));

    // Emit event for SSE
    eventBus.emit("new-transaction", newTx);
    console.log(
      `[Simulation] Created tx: ${newTx.id} for card ${randomCard.last4}`,
    );
  } catch (err) {
    console.error("[Simulation] Error:", err);
  }
};

// Start/Stop Simulation
app.post("/api/realtime/simulate", (req, res) => {
  const { active, intervalMs = 2000 } = req.body;

  if (active) {
    if (simulationInterval) clearInterval(simulationInterval);
    console.log(`[Simulation] Starting with interval ${intervalMs}ms`);
    simulationInterval = setInterval(createRandomTransaction, intervalMs);
    res.json({ message: "Simulation started", active: true });
  } else {
    if (simulationInterval) {
      clearInterval(simulationInterval);
      simulationInterval = null;
    }
    console.log("[Simulation] Stopped");
    res.json({ message: "Simulation stopped", active: false });
  }
});

// Polling Endpoint: Get transactions after a specific ID
app.get("/api/realtime/poll", async (req, res) => {
  try {
    const afterId = parseInt(req.query.afterId as string) || 0;
    const newTransactions = await db
      .select()
      .from(transactions)
      .where(gt(transactions.id, afterId))
      .orderBy(desc(transactions.id));

    res.json(newTransactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Polling failed" });
  }
});

// SSE Endpoint: Stream new transactions
app.get("/api/realtime/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const sendEvent = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Initial connection message
  sendEvent({ type: "connected", timestamp: Date.now() });

  // Listener function
  const onNewTransaction = (tx: any) => {
    sendEvent({ type: "transaction", data: tx });
  };

  // Subscribe
  eventBus.on("new-transaction", onNewTransaction);

  // Cleanup on disconnect
  req.on("close", () => {
    eventBus.off("new-transaction", onNewTransaction);
    res.end();
  });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
