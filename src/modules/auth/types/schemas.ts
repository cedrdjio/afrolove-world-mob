import { z } from 'zod';

// New passwords (register + reset) must be at least 8 characters and mix
// letters and digits. Login deliberately only checks non-emptiness: it
// validates against the stored hash server-side, and rejecting a legacy
// 6-character password client-side would lock its owner out.
const newPasswordSchema = z
  .string()
  .min(8, 'Au moins 8 caractères')
  .regex(/[a-zA-Z]/, 'Au moins une lettre')
  .regex(/[0-9]/, 'Au moins un chiffre');

export const loginSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: z.string().min(2, 'Au moins 2 caractères'),
    email: z.string().email('Adresse email invalide'),
    password: newPasswordSchema,
    acceptedTerms: z.literal(true, 'Vous devez accepter les conditions'),
  })
  .required();
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Adresse email invalide'),
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: newPasswordSchema,
    confirmPassword: z.string().min(1, 'Confirmation requise'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
