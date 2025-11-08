import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());

const JWT_SECRET = "eBf9$Z*V#y2^9GsJp3@fA6qL!xH4_TdQZp%78sX9Uv45"

// REGISTER
app.post("/register", async (req, res) => {

  const { username, email, password, firstName, lastName, address, phoneNumber, roleId } = req.body;
  const exists = await prisma.user.findUnique({ where: { email: email } });
  if (exists) return res.status(400).json({ error: "Email deja folosit!" });

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name: username,
      email: email,
      password: hashed,
      firstName: firstName,
      lastName: lastName,
      address,
      phoneNumber,
      role: { connect: { id: roleId } } // dacă rolul este pe id
    },
  });

  res.json({ success: true, user });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true }
  });

  if (!user) return res.status(400).json({ error: "Utilizator inexistent!" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: "Parola greșită!" });

  const token = jwt.sign({
    id: user.id,
    email: user.email,
    role: user.role.name
  }, JWT_SECRET, { expiresIn: "2h" });

  res.json({ token }

  );


  app.get("/roles", async (req, res) => {
    const roles = await prisma.role.findMany();
    res.json(roles);
  });


  // ======================== CATEGORY CRUD ========================

  // Get all categories
  app.get("/categories", async (req, res) => {
    const categories = await prisma.category.findMany();
    res.json(categories);
  });

  // Create category
  app.post("/categories", async (req, res) => {
    const { name } = req.body;
    try {
      const category = await prisma.category.create({ data: { name } });
      res.json(category);
    } catch (err) {
      res.status(400).json({ error: "Categoria există deja." });
    }
  });

  // ======================== PRODUCT CRUD ========================

  // Get all products with category name
  app.get("/products", async (req, res) => {
    const products = await prisma.product.findMany({
      include: { category: true }
    });
    res.json(products);
  });

  // Create a product
  app.post("/products", async (req, res) => {
    const { name, price, categoryId } = req.body;
    const product = await prisma.product.create({
      data: { name, price: parseFloat(price), categoryId: Number(categoryId) }
    });
    res.json(product);
  });


  // CHECK USER EXISTENCE
  app.get("/check-user-existence", async (req, res) => {
    const { email, phoneNumber } = req.query;

    if (!email && !phoneNumber) {
      return res.status(400).json({ error: "Trebuie trimis email sau phoneNumber!" });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { email: email.toString() } : undefined,
          phoneNumber ? { phoneNumber: phoneNumber.toString() } : undefined
        ].filter(Boolean)
      },
      select: {
        id: true,
        email: true,
        phoneNumber: true
      }
    });

    return res.json({ exists: !!user });
  });

  // ✅ LISTEN SHOULD BE LAST AND ONLY ONCE
  app.listen(3000, () =>
    console.log("✅ Server ON: http://localhost:3000")
  );
})