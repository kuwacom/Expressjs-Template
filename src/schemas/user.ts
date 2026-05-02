import z from 'zod';

const userNameSchema = z.string().trim().min(1).max(100);
const userIdSchema = z.number().int().positive();
const userCreatedAtSchema = z.string().datetime();

export const CreateUserBodySchema = z.object({
  name: userNameSchema,
});

export const UserParamsSchema = z.object({
  userId: z.coerce.number().int().positive(),
});

export const UserResponseSchema = z.object({
  id: userIdSchema,
  name: userNameSchema,
  createdAt: userCreatedAtSchema,
});

export const UserListResponseSchema = z.array(UserResponseSchema);

export type UserResponse = z.infer<typeof UserResponseSchema>;
export type UserListResponse = z.infer<typeof UserListResponseSchema>;
