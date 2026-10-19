// Cek autentikasi Login Admin
if (localStorage.getItem("isAdminLoggedIn") !== "true") {
  alert("Anda harus login terlebih dahulu!");
  window.location.href = "admin-login.html";
}

function logoutAdmin() {
  localStorage.removeItem("isAdminLoggedIn");
  window.location.href = "admin-login.html";
}

// Fungsi Utama Memuat Semua Data
async function loadAllData() {
  await Promise.all([loadProducts(), loadOrders(), loadContacts()]);
}

// 1. Ambil & Tampilkan Daftar Produk
async function loadProducts() {
  const tableBody = document.querySelector("#products-table-body");
  if (!tableBody) return;

  try {
    const response = await fetch("http://localhost:3000/api/admin/products");
    const products = await response.json();

    if (products.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center;">Belum ada menu produk.</td></tr>`;
      return;
    }

    tableBody.innerHTML = "";
    products.forEach((prod) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>#${prod.id}</td>
        <td>${prod.name}</td>
        <td>IDR ${prod.price.toLocaleString("id-ID")}</td>
        <td style="display: flex; gap: 0.5rem;">
          <button style="background-color: #ff9800; color: #000; border: none; padding: 0.4rem 0.8rem; border-radius: 0.3rem; cursor: pointer; font-weight: 600;" onclick="openEditModal(${prod.id}, '${prod.name}', ${prod.price})">Edit</button>
          <button class="btn-delete" onclick="deleteProduct(${prod.id})">Hapus</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  } catch (err) {
    console.error("Gagal memuat produk:", err);
    tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: red;">Gagal terhubung ke server backend.</td></tr>`;
  }
}

// 2. Tambah Produk Baru
const addProductForm = document.querySelector("#addProductForm");
if (addProductForm) {
  addProductForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.querySelector("#productName").value;
    const price = parseInt(document.querySelector("#productPrice").value);

    try {
      const response = await fetch("http://localhost:3000/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price })
      });

      if (response.ok) {
        alert("Produk baru berhasil ditambahkan!");
        addProductForm.reset();
        loadProducts();
      } else {
        alert("Gagal menambahkan produk.");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  });
}

// 3. Hapus Produk
async function deleteProduct(productId) {
  if (!confirm("Apakah Anda yakin ingin menghapus menu ini?")) return;

  try {
    const response = await fetch(`http://localhost:3000/api/admin/products/${productId}`, {
      method: "DELETE"
    });

    if (response.ok) {
      alert("Produk berhasil dihapus!");
      loadProducts();
    }
  } catch (err) {
    console.error("Gagal menghapus produk:", err);
  }
}

// 4. Modal Edit Produk
function openEditModal(id, name, price) {
  const idInput = document.querySelector("#editProductId");
  const nameInput = document.querySelector("#editProductName");
  const priceInput = document.querySelector("#editProductPrice");
  
  if (idInput) idInput.value = id;
  if (nameInput) nameInput.value = name;
  if (priceInput) priceInput.value = price;
  
  const modal = document.querySelector("#editProductModal");
  if (modal) modal.style.display = "flex";
}

function closeEditModal() {
  const modal = document.querySelector("#editProductModal");
  if (modal) modal.style.display = "none";
}

const editProductForm = document.querySelector("#editProductForm");
if (editProductForm) {
  editProductForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const id = document.querySelector("#editProductId").value;
    const name = document.querySelector("#editProductName").value;
    const price = parseInt(document.querySelector("#editProductPrice").value);

    try {
      const response = await fetch(`http://localhost:3000/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price })
      });

      if (response.ok) {
        alert("Menu berhasil diperbarui!");
        closeEditModal();
        loadProducts();
      } else {
        alert("Gagal memperbarui menu.");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  });
}

// 5. Ambil & Tampilkan Daftar Pesanan Masuk
async function loadOrders() {
  const tableBody = document.querySelector("#orders-table-body");
  if (!tableBody) return;

  try {
    const response = await fetch("http://localhost:3000/api/admin/orders");
    const orders = await response.json();

    if (orders.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center;">Belum ada transaksi masuk.</td></tr>`;
      return;
    }

    tableBody.innerHTML = "";

    orders.forEach((order) => {
      const orderId = order.id || order.order_id;
      const date = new Date(order.created_at).toLocaleString("id-ID");
      const statusClass =
        order.status === "Selesai" ? "badge-selesai" : "badge-pending";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>#${orderId || "N/A"}</td>
        <td>${order.customer_name}</td>
        <td>${order.phone}</td>
        <td>${order.items || "-"}</td>
        <td>IDR ${order.total_amount.toLocaleString("id-ID")}</td>
        <td>${date}</td>
        <td><span class="badge ${statusClass}">${order.status}</span></td>
        <td>
          <select onchange="updateStatus(${orderId}, this.value)">
            <option value="Pending" ${order.status === "Pending" ? "selected" : ""}>Pending</option>
            <option value="Selesai" ${order.status === "Selesai" ? "selected" : ""}>Selesai</option>
          </select>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    if (window.feather) feather.replace();
  } catch (err) {
    console.error("Gagal memuat pesanan:", err);
    tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: red;">Gagal terhubung ke server backend.</td></tr>`;
  }
}

async function updateStatus(orderId, newStatus) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/admin/orders/${orderId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      alert(`Status pesanan #${orderId} berhasil diubah menjadi ${newStatus}`);
      loadOrders();
    } else {
      alert("Gagal dari Server: " + (data.error || "Terjadi kesalahan"));
    }
  } catch (err) {
    console.error("Gagal memperbarui status:", err);
    alert("Terjadi kesalahan koneksi ke server.");
  }
}

// 6. Ambil & Tampilkan Daftar Pesan Kontak
async function loadContacts() {
  const tableBody = document.querySelector("#contacts-table-body");
  if (!tableBody) return;

  try {
    const response = await fetch("http://localhost:3000/api/admin/contacts");
    const contacts = await response.json();

    if (contacts.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">Belum ada pesan kontak masuk.</td></tr>`;
      return;
    }

    tableBody.innerHTML = "";
    contacts.forEach((msg) => {
      const date = new Date(msg.created_at).toLocaleString("id-ID");
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>#${msg.id}</td>
        <td>${msg.name}</td>
        <td>${msg.email}</td>
        <td>${msg.phone}</td>
        <td>${msg.message}</td>
        <td>${date}</td>
        <td>
          <button class="btn-delete" onclick="deleteContact(${msg.id})">Hapus</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  } catch (err) {
    console.error("Gagal memuat pesan kontak:", err);
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: red;">Gagal terhubung ke server backend.</td></tr>`;
  }
}

// Hapus Pesan Kontak
async function deleteContact(id) {
  if (!confirm("Apakah Anda yakin ingin menghapus pesan ini?")) return;

  try {
    const response = await fetch(`http://localhost:3000/api/admin/contacts/${id}`, {
      method: "DELETE"
    });

    if (response.ok) {
      alert("Pesan berhasil dihapus!");
      loadContacts();
    } else {
      alert("Gagal menghapus pesan.");
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

// Inisialisasi Event Listener Saat DOM Siap
document.addEventListener("DOMContentLoaded", function () {
  loadAllData();

  const refreshBtn = document.querySelector("#btn-refresh-data");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", function (e) {
      e.preventDefault();
      loadAllData();
    });
  }

  const logoutBtn = document.querySelector("#btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      logoutAdmin();
    });
  }
});