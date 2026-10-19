const BACKEND_URL = "https://kopikenangan-production.up.railway.app";

// Cek apakah admin sudah login saat halaman dibuka
document.addEventListener("DOMContentLoaded", () => {
  const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
  if (!isLoggedIn) {
    window.location.href = "admin-login.html";
    return;
  }

  loadProducts();
  loadOrders();
  loadContacts();

  // Tombol Refresh
  const btnRefresh = document.getElementById("btn-refresh-data");
  if (btnRefresh) {
    btnRefresh.addEventListener("click", () => {
      loadProducts();
      loadOrders();
      loadContacts();
      alert("Data berhasil dimuat ulang!");
    });
  }

  // Tombol Logout
  const btnLogout = document.getElementById("btn-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      localStorage.removeItem("isAdminLoggedIn");
      window.location.href = "admin-login.html";
    });
  }

  // Form Tambah Produk
  const addProductForm = document.getElementById("addProductForm");
  if (addProductForm) {
    addProductForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("productName").value;
      const price = document.getElementById("productPrice").value;

      try {
        const res = await fetch(`${BACKEND_URL}/api/admin/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, price })
        });
        const data = await res.json();
        if (res.ok) {
          alert("Produk berhasil ditambahkan!");
          addProductForm.reset();
          loadProducts();
        } else {
          alert(data.error || "Gagal menambahkan produk.");
        }
      } catch (err) {
        console.error("Error:", err);
        alert("Gagal terhubung ke server.");
      }
    });
  }

  // Form Edit Produk
  const editProductForm = document.getElementById("editProductForm");
  if (editProductForm) {
    editProductForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = document.getElementById("editProductId").value;
      const name = document.getElementById("editProductName").value;
      const price = document.getElementById("editProductPrice").value;

      try {
        const res = await fetch(`${BACKEND_URL}/api/admin/products/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, price })
        });
        if (res.ok) {
          alert("Produk berhasil diperbarui!");
          closeEditModal();
          loadProducts();
        } else {
          alert("Gagal memperbarui produk.");
        }
      } catch (err) {
        console.error("Error:", err);
        alert("Gagal terhubung ke server.");
      }
    });
  }
});

// Fungsi Memuat Daftar Produk
async function loadProducts() {
  const tbody = document.getElementById("products-table-body");
  if (!tbody) return;

  try {
    const res = await fetch(`${BACKEND_URL}/api/admin/products`);
    const products = await res.json();

    if (products.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align: center;">Belum ada menu produk.</td></tr>`;
      return;
    }

    tbody.innerHTML = products.map((p, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${p.name}</td>
        <td>IDR ${Number(p.price).toLocaleString()}</td>
        <td>
          <button class="btn-refresh" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; display: inline-block; margin-right: 0.3rem;" onclick="openEditModal('${p._id || p.id}', '${p.name}', ${p.price})">Edit</button>
          <button class="btn-delete" onclick="deleteProduct('${p._id || p.id}')">Hapus</button>
        </td>
      </tr>
    `).join("");
  } catch (err) {
    console.error("Error:", err);
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: red;">Gagal memuat produk.</td></tr>`;
  }
}

// Fungsi Hapus Produk
async function deleteProduct(id) {
  if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;

  try {
    const res = await fetch(`${BACKEND_URL}/api/admin/products/${id}`, {
      method: "DELETE"
    });
    if (res.ok) {
      alert("Produk berhasil dihapus!");
      loadProducts();
    } else {
      alert("Gagal menghapus produk.");
    }
  } catch (err) {
    console.error("Error:", err);
    alert("Gagal terhubung ke server.");
  }
}

// Modal Edit Handler
function openEditModal(id, name, price) {
  document.getElementById("editProductId").value = id;
  document.getElementById("editProductName").value = name;
  document.getElementById("editProductPrice").value = price;
  document.getElementById("editProductModal").style.display = "flex";
}

function closeEditModal() {
  document.getElementById("editProductModal").style.display = "none";
}

// Fungsi Memuat Daftar Transaksi/Pesanan
async function loadOrders() {
  const tbody = document.getElementById("orders-table-body");
  if (!tbody) return;

  try {
    const res = await fetch(`${BACKEND_URL}/api/admin/orders`);
    const orders = await res.json();

    if (orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center;">Belum ada transaksi masuk.</td></tr>`;
      return;
    }

    tbody.innerHTML = orders.map((o, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${o.name || o.customerName || "-"}</td>
        <td>${o.phone || "-"}</td>
        <td>${Array.isArray(o.items) ? o.items.map(i => `${i.name} (${i.size}) x${i.quantity}`).join(", ") : "-"}</td>
        <td>IDR ${Number(o.total || o.totalPrice || 0).toLocaleString()}</td>
        <td>${o.date ? new Date(o.date).toLocaleString() : "-"}</td>
        <td><span class="badge ${o.status === 'Selesai' ? 'badge-selesai' : 'badge-pending'}">${o.status || 'Pending'}</span></td>
        <td>
          <button class="btn-delete" onclick="deleteOrder('${o._id || o.id}')">Hapus</button>
        </td>
      </tr>
    `).join("");
  } catch (err) {
    console.error("Error:", err);
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: red;">Gagal memuat pesanan.</td></tr>`;
  }
}

// Fungsi Hapus Pesanan
async function deleteOrder(id) {
  if (!confirm("Apakah Anda yakin ingin menghapus data pesanan ini?")) return;

  try {
    const res = await fetch(`${BACKEND_URL}/api/admin/orders/${id}`, {
      method: "DELETE"
    });
    if (res.ok) {
      alert("Pesanan berhasil dihapus!");
      loadOrders();
    } else {
      alert("Gagal menghapus pesanan.");
    }
  } catch (err) {
    console.error("Error:", err);
    alert("Gagal terhubung ke server.");
  }
}

// Fungsi Memuat Pesan Kontak
async function loadContacts() {
  const tbody = document.getElementById("contacts-table-body");
  if (!tbody) return;

  try {
    const res = await fetch(`${BACKEND_URL}/api/admin/contacts`);
    const contacts = await res.json();

    if (contacts.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center;">Belum ada pesan kontak.</td></tr>`;
      return;
    }

    tbody.innerHTML = contacts.map((c, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${c.name || "-"}</td>
        <td>${c.email || "-"}</td>
        <td>${c.phone || "-"}</td>
        <td>${c.message || "-"}</td>
        <td>${c.date ? new Date(c.date).toLocaleString() : "-"}</td>
        <td>
          <button class="btn-delete" onclick="deleteContact('${c._id || c.id}')">Hapus</button>
        </td>
      </tr>
    `).join("");
  } catch (err) {
    console.error("Error:", err);
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: red;">Gagal memuat pesan kontak.</td></tr>`;
  }
}

// Fungsi Hapus Pesan Kontak
async function deleteContact(id) {
  if (!confirm("Apakah Anda yakin ingin menghapus pesan ini?")) return;

  try {
    const res = await fetch(`${BACKEND_URL}/api/admin/contacts/${id}`, {
      method: "DELETE"
    });
    if (res.ok) {
      alert("Pesan berhasil dihapus!");
      loadContacts();
    } else {
      alert("Gagal menghapus pesan.");
    }
  } catch (err) {
    console.error("Error:", err);
    alert("Gagal terhubung ke server.");
  }
}