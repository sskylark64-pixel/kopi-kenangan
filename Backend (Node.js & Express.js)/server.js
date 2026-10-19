const express = require("express");
const cors = require("cors");
const app = express();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Sementara (In-Memory Data)
let products = [
  { id: "1", name: "Kopi Kenangan Senja", price: 18000 },
  { id: "2", name: "Espresso", price: 15000 },
  { id: "3", name: "Kapucino", price: 20000 }
];

let orders = [];
let contacts = [];

// Base Route
app.get("/", (req, res) => {
  res.json({
    status: "Online",
    message: "Server Backend Kopi Kenangan Senja Berjalan!"
  });
});

// Endpoint Admin Login
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin123") {
    res.json({ success: true, message: "Login berhasil!" });
  } else {
    res.status(401).json({ success: false, error: "Username atau password salah!" });
  }
});

// Endpoint Produk
app.get("/api/admin/products", (req, res) => {
  res.json(products);
});

app.post("/api/admin/products", (req, res) => {
  const { name, price } = req.body;
  if (!name || !price) {
    return res.status(400).json({ error: "Nama dan harga produk wajib diisi." });
  }
  const newProduct = {
    id: Date.now().toString(),
    name,
    price: Number(price)
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.put("/api/admin/products/:id", (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;
  const index = products.findIndex((p) => p.id === id);
  if (index !== -1) {
    products[index] = { ...products[index], name, price: Number(price) };
    res.json(products[index]);
  } else {
    res.status(404).json({ error: "Produk tidak ditemukan." });
  }
});

app.delete("/api/admin/products/:id", (req, res) => {
  const { id } = req.params;
  products = products.filter((p) => p.id !== id);
  res.json({ message: "Produk berhasil dihapus." });
});

// Endpoint Pesanan/Transaksi
app.get("/api/admin/orders", (req, res) => {
  res.json(orders);
});

app.post("/api/orders", (req, res) => {
  const { name, phone, items, total } = req.body;
  const newOrder = {
    id: Date.now().toString(),
    name,
    phone,
    items,
    total,
    date: new Date(),
    status: "Pending"
  };
  orders.push(newOrder);
  res.status(201).json(newOrder);
});

app.delete("/api/admin/orders/:id", (req, res) => {
  const { id } = req.params;
  orders = orders.filter((o) => o.id !== id);
  res.json({ message: "Pesanan berhasil dihapus." });
});

// Endpoint Kontak
app.get("/api/admin/contacts", (req, res) => {
  res.json(contacts);
});

app.post("/api/contacts", (req, res) => {
  const { name, email, phone, message } = req.body;
  const newContact = {
    id: Date.now().toString(),
    name,
    email,
    phone,
    message,
    date: new Date()
  };
  contacts.push(newContact);
  res.status(201).json(newContact);
});

app.delete("/api/admin/contacts/:id", (req, res) => {
  const { id } = req.params;
  contacts = contacts.filter((c) => c.id !== id);
  res.json({ message: "Pesan kontak berhasil dihapus." });
});

// Menjalankan Server
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});