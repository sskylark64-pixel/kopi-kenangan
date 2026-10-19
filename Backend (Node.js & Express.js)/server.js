const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Koneksi Database MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'kopi_kenangan'
});

db.connect((err) => {
  if (err) {
    console.error('Gagal terhubung ke database MySQL:', err);
    return;
  }
  console.log('Berhasil terhubung ke database MySQL.');
});

// --- ENDPOINT PUBLIK: PRODUK ---
app.get('/api/products', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// --- ENDPOINT PUBLIK: TRANSAKSI / ORDER ---
app.post('/api/orders', (req, res) => {
  const { customer_name, phone, total_amount, items } = req.body;
  const itemsString = items.map(i => `${i.name} (${i.quantity}x)`).join(', ');

  const queryOrder = 'INSERT INTO orders (customer_name, phone, total_amount, items, status) VALUES (?, ?, ?, ?, "Pending")';
  db.query(queryOrder, [customer_name, phone, total_amount, itemsString], (err, result) => {
    if (err) {
      console.error('Error MySQL Order:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Pesanan berhasil disimpan!', orderId: result.insertId });
  });
});

// --- ENDPOINT PUBLIK: KONTAK ---
app.post('/api/contacts', (req, res) => {
  const { name, email, phone, message } = req.body;
  const query = 'INSERT INTO contacts (name, email, phone, message) VALUES (?, ?, ?, ?)';
  db.query(query, [name, email, phone, message], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Pesan berhasil dikirim!' });
  });
});

// --- FITUR LOGIN ADMIN ---
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'kopi123') {
    res.json({ success: true, message: 'Login berhasil!' });
  } else {
    res.status(401).json({ success: false, error: 'Username atau password salah!' });
  }
});

// --- FITUR MANAJEMEN PRODUK (ADMIN) ---
app.get('/api/admin/products', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/admin/products', (req, res) => {
  const { name, price, image } = req.body;
  const query = 'INSERT INTO products (name, price, image) VALUES (?, ?, ?)';
  const imgPath = image || 'coffe/jeremy-yap-jn-HaGWe4yw-unsplash (1).jpg';

  db.query(query, [name, price, imgPath], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Produk berhasil ditambahkan!', productId: result.insertId });
  });
});

app.put('/api/admin/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;
  const query = 'UPDATE products SET name = ?, price = ? WHERE id = ?';
  db.query(query, [name, price, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Produk berhasil diperbarui!' });
  });
});

app.delete('/api/admin/products/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM products WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Produk berhasil dihapus!' });
  });
});

// --- FITUR MANAJEMEN PESANAN (ADMIN) ---
// Hanya menampilkan pesanan yang statusnya BUKAN 'Selesai'
app.get('/api/admin/orders', (req, res) => {
  db.query("SELECT * FROM orders WHERE status != 'Selesai' ORDER BY created_at DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.put('/api/admin/orders/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const query = 'UPDATE orders SET status = ? WHERE id = ?';
  db.query(query, [status, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Status pesanan berhasil diperbarui!' });
  });
});

// --- FITUR MANAJEMEN KONTAK (ADMIN) ---
app.get('/api/admin/contacts', (req, res) => {
  db.query('SELECT * FROM contacts ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.delete('/api/admin/contacts/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM contacts WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Pesan kontak berhasil dihapus!' });
  });
});

app.listen(3000, () => {
  console.log('Server backend berjalan di http://localhost:3000');
});