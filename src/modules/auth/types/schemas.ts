import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(6, 'Au moins 6 caractères'),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: z.string().min(2, 'Au moins 2 caractères'),
    email: z.string().email('Adresse email invalide'),
    password: z.string().min(6, 'Au moins 6 caractères'),
    acceptedTerms: z.literal(true, 'Vous devez accepter les conditions'),
  })
  .required();
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Adresse email invalide'),
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
