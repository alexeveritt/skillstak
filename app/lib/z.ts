import { z } from "zod";

export const emailSchema = z.string().email();
export const passwordSchema = z.string().min(6).max(72);
export const idSchema = z.string().min(1);

export const cardSchema = z.object({
  front: z
    .string()
    .min(1, { message: "Front is required" })
    .max(200, { message: "Front must be at most 200 characters" }),
  back: z.string().min(1, { message: "Back is required" }).max(200, { message: "Back must be at most 200 characters" }),
});

export const projectSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Project name is required" })
    .max(50, { message: "Project name must be at most 50 characters" }),
  color: z.string().optional(),
});
