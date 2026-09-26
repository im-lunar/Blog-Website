import { Hono } from "hono";
import { createPrisma } from "../db";
import { verify } from "hono/jwt";

type Bindings = {
  DATABASE_URL: string,
  JWT_SECRET: string
}

type Variables = {
  userId: string
}

export const blogRouter = new Hono<{
    Bindings: Bindings,
    Variables: Variables
}>();

function prisma(c: { env: Bindings }) {
  return createPrisma(c.env.DATABASE_URL);
}

// Middleware
blogRouter.use('/*', async (c, next) => {
    const authHeader = c.req.header("Authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
        return c.json({ error: "Missing token"});
    }

    try {
        const user = await verify(token, c.env.JWT_SECRET, "HS256");
        if (user && user.id) {
            c.set("userId", user.id as string);
            await next();
        } else {
            return c.json({ error: "Unauthorized" }, 403);
        }
    }  catch(e) {
        return c.json({ message: "Invalid or Expired token" }, 403);
    }
})

// Create blog route
blogRouter.post('/', async (c) => {
    const db = prisma(c);

    const body = await c.req.json();
    const userId = c.get("userId");

    const blog = await db.post.create({
        data: {
            title: body.title,
            content: body.content,
            authorId: userId
        }
    })

    return c.json({
        id: blog.id,

    })
})

// Update blog route
blogRouter.put('/', async (c) => {
    const db = prisma(c);

    const body = await c.req.json();

    const blog = await db.post.update({
        where: {
            id: body.id
        },
        data: {
            title: body.title,
            content: body.content,
            authorId: "1"
        }
    })

    return c.json({ id: blog.id });
})

// 
blogRouter.get('/bulk', (c) => {
    return c.text("hello hono")
})