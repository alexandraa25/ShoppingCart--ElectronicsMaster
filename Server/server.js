import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import session from "express-session";

const app = express();
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

const JWT_SECRET = "eBf9$Z*V#y2^9GsJp3@fA6qL!xH4_TdQZp%78sX9Uv45";

const uploadPath = "uploads/products";
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

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

// ======================== GET ALL USERS ========================
app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,       
        role: {
          select: { name: true } // rolul (ex: admin, user)
        }
      }
    });

    res.json(users);
  } catch (error) {
    console.error("EROARE LA USERS: ", error);
    res.status(500).json({ error: "Eroare la obținerea utilizatorilor." });
  }
});

app.delete("/users/:id", async (req, res) => {
  const userId = Number(req.params.id);

  try {
    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({ success: true, message: "Utilizator șters definitiv." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Eroare la ștergerea utilizatorului." });
  }
});

app.put("/users/:id/suspend", async (req, res) => {
  const userId = Number(req.params.id);

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { status: "SUSPENDED" }
    });

    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Eroare la suspendarea utilizatorului." });
  }
});
app.put("/users/:id/activate", async (req, res) => {
  try {
    const userId = Number(req.params.id);

    await prisma.user.update({
      where: { id: userId },
      data: { status: "ACTIVE" }
    });

    res.json({ success: true });
  } catch (error) {
    console.error("EROARE ACTIVARE USER:", error);
    res.status(500).json({ error: "Eroare la activarea utilizatorului." });
  }
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
  try {
    const products = await prisma.product.findMany({
      include: { images: true }
    });

    const formatted = products.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      categoryId: p.categoryId,
      createdAt: p.createdAt,
      imageUrl: p.images.length > 0 
        ? `http://localhost:3000${p.images[0].url}`
        : null
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Eroare la încărcarea produselor." });
  }
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

    if (existingImages !== undefined) {
      const keepUrls = JSON.parse(existingImages);

      const existing = await prisma.productImage.findMany({ where: { productId } });

      const toDelete = existing.filter(img => !keepUrls.includes(img.url));
      for (const img of toDelete) {
        const filePath = path.join(process.cwd(), img.url.replace(/^\//, ''));

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        await prisma.productImage.delete({ where: { id: img.id } });
      }
    }

    if (req.files?.length > 0) {
      await prisma.productImage.createMany({
        data: req.files.map(file => ({
          url: `/uploads/products/${file.filename}`,
          productId
        }))
      });
    }

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

app.delete("/products/:id", async (req, res) => {
  const productId = Number(req.params.id);

  try {
    await prisma.$transaction(async (tx) => {

      const product = await tx.product.findUnique({
        where: { id: productId },
        include: { images: true }
      });

      if (!product) {
        return res.status(404).json({ error: "Produsul nu există." });
      }

      // 1) Mutăm produsul în tabela DeletedProduct
      const deleted = await tx.deletedProduct.create({
        data: {
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          categoryId: product.categoryId,
          images: {
            create: product.images.map(img => ({
              url: img.url
            }))
          }
        }
      });

      // 2) Ștergem doar înregistrările din produsele active
      await tx.productImage.deleteMany({ where: { productId } });
      await tx.product.delete({ where: { id: productId } });

    });

    res.json({ success: true, message: "Produsul a fost mutat în coșul șterse." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Eroare la ștergerea (arhivarea) produsului." });
  }
});



// ======================== COS ========================
app.use(cors({
  origin: "http://localhost:4200",
  credentials: true
}));

app.use(session({
  secret: "super_secret_key_schimba",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: false
  }
}));
function getCart(req) {
  if (!req.session.cart) {
    req.session.cart = { items: [], totalQty: 0, total: 0 }; 
  }
  return req.session.cart;
}

function recalc(cart) {
  cart.totalQty = cart.items.reduce((s, it) => s + it.qty, 0);
  cart.total = cart.items.reduce((s, it) => s + it.qty * it.price, 0);
}
// GET /cart – vezi coșul din sesiune
app.get("/cart", (req, res) => {
  const cart = getCart(req);
  res.json(cart);
});

// POST /cart/add  { productId, qty }
app.post("/cart/add", async (req, res) => {
  try {
    const { productId, qty = 1 } = req.body;
    const id = Number(productId);
    const count = Number(qty);

    if (!id || count <= 0) return res.status(400).json({ error: "Date invalide." });

    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true }
    });
    if (!product) return res.status(404).json({ error: "Produsul nu există." });
    if (product.stock < count) return res.status(400).json({ error: "Stoc insuficient." });

    const cart = getCart(req);
    const existing = cart.items.find(i => i.productId === id);

    if (existing) {
      // poți limita la stoc
      if (existing.qty + count > product.stock)
        return res.status(400).json({ error: "Depășește stocul." });
      existing.qty += count;
    } else {
      cart.items.push({
        productId: id,
        name: product.name,
        price: product.price,
        qty: count,
        imageUrl: product.images?.[0]?.url ? `http://localhost:3000${product.images[0].url}` : null
      });
    }

    recalc(cart);
    res.json(cart);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Eroare la adăugare în coș." });
  }
});

// PATCH /cart/update  { productId, qty }
app.patch("/cart/update", async (req, res) => {
  try {
    const { productId, qty } = req.body;
    const id = Number(productId);
    const count = Number(qty);

    if (!id || count < 0) return res.status(400).json({ error: "Date invalide." });

    const cart = getCart(req);
    const item = cart.items.find(i => i.productId === id);
    if (!item) return res.status(404).json({ error: "Articol inexistent." });

    if (count === 0) {
      cart.items = cart.items.filter(i => i.productId !== id);
    } else {
      // verifică stoc actual
      const product = await prisma.product.findUnique({ where: { id } });
      if (!product) return res.status(404).json({ error: "Produsul nu există." });
      if (count > product.stock) return res.status(400).json({ error: "Depășește stocul." });
      item.qty = count;
    }

    recalc(cart);
    res.json(cart);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Eroare la actualizare coș." });
  }
});

// DELETE /cart/item/:productId
app.delete("/cart/item/:productId", (req, res) => {
  const id = Number(req.params.productId);
  const cart = getCart(req);
  cart.items = cart.items.filter(i => i.productId !== id);
  recalc(cart);
  res.json(cart);
});

// DELETE /cart – golește coșul
app.delete("/cart", (req, res) => {
  req.session.cart = { items: [], totalQty: 0, total: 0 };
  res.json(req.session.cart);
});

// ======================== START SERVER ========================
app.listen(3000, () =>
  console.log("✅ Server ON: http://localhost:3000")
);
