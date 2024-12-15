import { z } from "zod";

export const userCreateSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  location: z.string().optional(),
  birthDate: z.string().min(1, "Birth date is required").date(),
  anniversaryDate: z.string().date().optional(),
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;

export const userUpdateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  birthDate: z.string().date().optional(),
  anniversaryDate: z.string().date().optional(),
});

export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
