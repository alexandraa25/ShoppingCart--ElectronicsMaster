import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());

const JWT_SECRET = "schimba_cheia_cu_o_cheie_puternica";

// REGISTER
app.post("/register", async (req, res) => {
  const { email, password, name } = req.body;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(400).json({ error: "Email deja folosit!" });

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, password: hashed, name },
  });

  res.json({ success: true, user });
});

// LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: "Utilizator inexistent!" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: "Parola greșită!" });

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: "2h",
  });

  res.json({ token, user });
});

app.listen(3000, () => console.log("✅ Server ON: http://localhost:3000"));

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


// ✅ LISTEN SHOULD BE LAST
app.listen(3000, () =>
  console.log("✅ Server ON: http://localhost:3000")
);