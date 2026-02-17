import { z } from "zod";

export const createCardSchema = z.object({
  name: z.string().min(1, "Name is required"),
  limitAmount: z.number().min(1, "Limit must be at least 1 cent"),
});

export const updateCardSchema = z.object({
  status: z.enum(["ACTIVE", "FROZEN", "TERMINATED"]).optional(),
  limitAmount: z.number().min(1).optional(),
});
