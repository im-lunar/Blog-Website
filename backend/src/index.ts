import { Hono } from 'hono'
import { createPrisma } from './db'
import { decode, sign, verify } from 'hono/jwt'

type Bindings = {
  DATABASE_URL: string,
  JWT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

function prisma(c: { env: Bindings }) {
  return createPrisma(c.env.DATABASE_URL);
}

app.get('/', (c) => {
  return c.text('Hello Hono!') 
})

app.post('/api/v1/signup', async (c) => {
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

app.post('/api/v1/signin', async (c) => {
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

app.post('/api/v1/blog', (c) => {
  return c.text('Hello Hono!')

})

app.get('/api/v1/blog/:id', (c) => {
  return c.text('Hello Hono!')

})

app.put('/api/v1/blog/:id', (c) => {
  return c.text('Hello Hono!')
})

export default app
