import z, { email } from "zod";
export const signupInput = z.object({
    email: z.email(),
    password: z.string().min(6),
    name: z.string().min(3).optional()
});
export const signinInput = z.object({
    email: z.email(),
    password: z.string().min(6)
});
export const createBlogInput = z.object({
    title: z.string(),
    content: z.string()
});
export const updateBlogInput = z.object({
    title: z.string().optional(),
    content: z.string().optional(),
    id: z.string()
});
