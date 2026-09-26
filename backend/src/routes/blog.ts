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
        id: blog.id
    })
})

// Update blog route
blogRouter.put('/', async (c) => {
    const db = prisma(c);

    const body = await c.req.json();
    const userId = c.get("userId");

    try {
        const blog = await db.post.update({
            where: {
                id: body.id
            },
            data: {
                title: body.title,
                content: body.content,
                authorId: userId
            }
        })

        return c.json({ id: blog.id }, 201);
    } catch(e) {
        return c.json({ error: "Failed to create a blog post" }, 500);
    }
})

// Fetching blogs in bulk
blogRouter.get('/bulk', async (c) => {
    const db = prisma(c);
    
    try {
        const blogs = await db.post.findMany({
            select: {
                id: true,
                title: true,
                content: true,
                author: {
                    select: {
                        name: true
                    }
                }
            }
        });

        return c.json({ blogs })
    } catch(e) {
        return c.json({ message: "Failed to fetch blogs" }, 500)
    }
})

// Get a single blog by ID
blogRouter.get('/:id', async (c) => {
    const db = prisma(c);
    const id = c.req.param("id");

    try {
        const blog = await db.post.findUnique({
            where: {
                id
            },
            select: {
                id: true,
                title: true,
                content: true,
                author: {
                    select: {
                        name: true
                    }
                }
            }
        });

        if (!blog) {
            return c.json({ error: "Blog not found" }, 404);
        }

        return c.json({
            blog
        })
    } catch(e) {
        return c.json({ error: "Failed to fetch the blog post"}, 500);
    }
})