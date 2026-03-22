import z from 'zod';

export const CreateUserBodySchema = z.object({
  name: z.string().trim().min(1).max(100),
});

export const UserParamsSchema = z.object({
  userId: z.coerce.number().int().positive(),
});
