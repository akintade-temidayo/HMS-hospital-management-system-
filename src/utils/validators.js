import { z } from "zod";
export const emailSchema = z.email();
export const passwordSchema = z.string().min(8, "Use at least 8 characters");
export const loginSchema = z.object({ email: emailSchema, password: passwordSchema });
