import { z } from "zod";

export const emailSchema = z.string().email();
export const passwordSchema = z.string().min(6).max(72);
export const idSchema = z.string().min(1);

export const cardSchema = z.object({
  front: z.string().min(1),
  back: z.string().min(1),
  color: z.string().optional()
});

export const projectSchema = z.object({ name: z.string().min(1).max(80) });

