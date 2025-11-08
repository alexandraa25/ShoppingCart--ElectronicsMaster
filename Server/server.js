import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import multer from "multer";
import path from "path";
import crypto from "crypto";

const app = express();
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());

// Expunem folderul cu imaginile
app.use("/uploads", express.static("uploads"));

const JWT_SECRET = "eBf9$Z*V#y2^9GsJp3@fA6qL!xH4_TdQZp%78sX9Uv45";

// Creăm folderul pentru imagini dacă nu există
const uploadPath = "uploads/products";
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Multer storage cu nume unic
const storage = multer.diskStorage({
  destination: uploadPath,
  filename: (req, file, cb) => {
    const uniqueName = crypto.randomUUID() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// ======================== REGISTER ========================
app.post("/register", async (req, res) => {
  const { username, email, password, firstName, lastName, address, phoneNumber, roleId } = req.body;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(400).json({ error: "Email deja folosit!" });

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name: username,
      email,
      password: hashed,
      firstName,
      lastName,
      address,
      phoneNumber,
      role: { connect: { id: roleId } }
    },
  });

  res.json({ success: true, user });
});

// ======================== LOGIN ========================
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true }
  });

  if (!user) return res.status(400).json({ error: "Utilizator inexistent!" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: "Parola greșită!" });

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role.name },
    JWT_SECRET,
    { expiresIn: "2h" }
  );

  res.json({ token });
});

// ======================== ROLE ========================
app.get("/roles", async (req, res) => {
  const roles = await prisma.role.findMany();
  res.json(roles);
});

// ======================== CATEGORY CRUD ========================
app.get("/categories", async (req, res) => {
  const categories = await prisma.category.findMany();
  res.json(categories);
});

app.post("/categories", async (req, res) => {
  const { name } = req.body;
  try {
    const category = await prisma.category.create({ data: { name } });
    res.json(category);
  } catch {
    res.status(400).json({ error: "Categoria există deja." });
  }
});

// ======================== PRODUCT CRUD ========================

app.get("/products", async (req, res) => {
  const products = await prisma.product.findMany({
    include: { category: true, images: true }
  });
  res.json(products);
});

app.post("/add-product", upload.array("images", 5), async (req, res) => {
  try {
    const { name, description, price, stock, categoryId } = req.body;

    if (!name || !price || !stock || !categoryId) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        categoryId: parseInt(categoryId)
      }
    });

    if (req.files?.length > 0) {
      await prisma.productImage.createMany({
        data: req.files.map(file => ({
          url: `/uploads/products/${file.filename}`,
          productId: product.id
        }))
      });
    }

    const savedProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: { images: true, category: true }
    });

    res.json({ success: true, product: savedProduct });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Eroare la crearea produsului." });
  }
});

app.get("/products/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true
      }
    });

    if (!product) {
      return res.status(404).json({ error: "Produsul nu există." });
    }

    console.log("Product:", JSON.stringify(product, null, 2));

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Eroare la preluarea datelor produsului." });
  }
});


app.put("/products/:id", upload.array("images", 5), async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const { name, description, price, stock, categoryId, existingImages } = req.body;

    // actualizare info produs
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        categoryId: parseInt(categoryId)
      }
    });

    // 1) Ștergere imagini unde nu mai apar în existingImages
    if (existingImages !== undefined) {
      const keepUrls = JSON.parse(existingImages); // lista care rămâne

      const existing = await prisma.productImage.findMany({ where: { productId } });

      const toDelete = existing.filter(img => !keepUrls.includes(img.url));
console.log('ToDelete ' + toDelete);
      for (const img of toDelete) {
        const filePath = path.join(process.cwd(), img.url.replace(/^\//, ''));

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        await prisma.productImage.delete({ where: { id: img.id } });
      }
    }

    // 2) Adăugăm imaginile noi încărcate
    if (req.files?.length > 0) {
      await prisma.productImage.createMany({
        data: req.files.map(file => ({
          url: `/uploads/products/${file.filename}`,
          productId
        }))
      });
    }

    // returnăm produsul actualizat cu toate imaginile rămase
    const finalProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true, category: true }
    });

    res.json({ success: true, product: finalProduct });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Eroare la actualizarea produsului." });
  }
});



// ======================== START SERVER ========================
app.listen(3000, () =>
  console.log("✅ Server ON: http://localhost:3000")
);
