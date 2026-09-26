import { Hono } from "hono";
import { createPrisma } from "../db";
import { sign } from "hono/jwt";

type Bindings = {
  DATABASE_URL: string,
  JWT_SECRET: string
}

type Variables = {
  userId: string
}

export const userRouter = new Hono<{
    Bindings: Bindings,
    Variables: Variables
}>();

function prisma(c: { env: Bindings }) {
  return createPrisma(c.env.DATABASE_URL);
}

userRouter.post('/signup', async (c) => {
  const db = prisma(c);

  const body = await c.req.json();

  const existing = await db.user.findUnique({ where: { email: body.email } });
  if (existing) {
    return c.json({
      error: "User already exists"
    }, 409)
  }

  const user = await db.user.create({
    data: {
      name: body.name,
      email: body.email,
      password: body.password,
    },
  });

  const token = await sign({id: user.id}, c.env.JWT_SECRET);
  return c.json({
    jwt: token
  });

})

userRouter.post('/signin', async (c) => {
  const db = prisma(c);

  const body = await c.req.json();

  const user = await db.user.findUnique({ where: { email: body.email } });
  if (!user || user.password !== body.password) {
    return c.json({
      error: "Invalid Credentials"
    }, 401)
  }

  const token = await sign({id: user.id}, c.env.JWT_SECRET);
  return c.json({
    jwt: token
  });
})