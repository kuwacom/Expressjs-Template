import z from 'zod';

export const TestResponseSchema = z.object({
  message: z.string().min(1),
});

export type TestResponse = z.infer<typeof TestResponseSchema>;
