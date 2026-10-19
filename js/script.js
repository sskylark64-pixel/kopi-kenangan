// ==========================================
// KONFIGURASI UTAMA
// ==========================================
const API_URL = "https://kopikenangan-production.up.railway.app/api";
const ADMIN_PHONE_NUMBER = "6285179804209"; // Nomor WhatsApp Admin

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let products = [];

// ==========================================
// 1. MEMUAT PRODUK & FITUR SEARCH INTERAKTIF
// ==========================================
async function fetchProducts() {
  const menuRow = document.querySelector("#menu-products-row");
  if (!menuRow) return;

  try {
    const response = await fetch(`${API_URL}/products`);
    products = await response.json();

    renderProducts(products);
  } catch (err) {
    console.error("Gagal memuat produk:", err);
    menuRow.innerHTML = `<p style="text-align:center; color:red; grid-column: 1/-1;">Gagal terhubung ke server backend.</p>`;
  }
}

// Render Kartu Menu ke HTML
function renderProducts(listProducts) {
  const menuRow = document.querySelector("#menu-products-row");
  if (!menuRow) return;

  if (listProducts.length === 0) {
    menuRow.innerHTML = `<p style="text-align:center; grid-column: 1/-1; color: #aaa;">Menu kopi tidak ditemukan.</p>`;
    return;
  }

  menuRow.innerHTML = "";
  listProducts.forEach((product) => {
    const productId = product.id || product._id;
    const card = document.createElement("div");
    card.classList.add("menu-card");
    card.innerHTML = `
      <img src="${product.image || 'img/Gemini_Generated_Image_4scdzn4scdzn4scd.jpg'}" alt="${product.name}" />
      <h3 class="menu-card-title">${product.name}</h3>
      <p class="menu-card-price">IDR ${Number(product.price).toLocaleString("id-ID")}</p>
      <button class="btn-add" type="button" onclick="openCustomModal('${productId}', '${product.name}', ${product.price})">
        <i data-feather="shopping-cart" style="width: 16px; height: 16px;"></i> Tambah Ke Keranjang
      </button>
    `;
    menuRow.appendChild(card);
  });

  if (window.feather) feather.replace();
}

// Live Search Listener
const searchBox = document.querySelector("#search-box");
if (searchBox) {
  searchBox.addEventListener("input", function (e) {
    const keyword = e.target.value.toLowerCase().trim();
    const filtered = products.filter((p) => p.name.toLowerCase().includes(keyword));
    renderProducts(filtered);
  });
}

// ==========================================
// 2. MODAL KUSTOMISASI PRODUK
// ==========================================
let selectedProduct = null;

function openCustomModal(id, name, price) {
  selectedProduct = { id, name, price };
  
  const modal = document.querySelector("#customModal");
  const title = document.querySelector("#modalProductName");
  const basePrice = document.querySelector("#modalBasePrice");

  if (title) title.textContent = name;
  if (basePrice) basePrice.textContent = `IDR ${Number(price).toLocaleString("id-ID")}`;

  if (modal) modal.classList.add("active");
}

function closeCustomModal() {
  const modal = document.querySelector("#customModal");
  if (modal) modal.classList.remove("active");
  selectedProduct = null;
}

const customForm = document.querySelector("#customProductForm");
if (customForm) {
  customForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!selectedProduct) return;

    const size = document.querySelector('input[name="size"]:checked')?.value || "Reguler";
    const sugar = document.querySelector('input[name="sugar"]:checked')?.value || "Normal Sugar";
    const ice = document.querySelector('input[name="ice"]:checked')?.value || "Normal Ice";

    const fullName = `${selectedProduct.name} (${size}, ${sugar}, ${ice})`;

    addToCart(selectedProduct.id, fullName, selectedProduct.price);
    closeCustomModal();
  });
}

// ==========================================
// 3. MANAJEMEN KERANJANG BELANJA (CART)
// ==========================================
function addToCart(id, name, price) {
  const existingItem = cart.find((item) => item.name === name);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id, name, price, quantity: 1 });
  }

  saveAndUpdateCart();
  alert(`${name} berhasil ditambahkan ke keranjang!`);
}

function updateQuantity(index, delta) {
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }
  saveAndUpdateCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveAndUpdateCart();
}

function clearCart() {
  cart = [];
  saveAndUpdateCart();
}

function saveAndUpdateCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  const cartContainer = document.querySelector("#cart-items-container");
  const cartCount = document.querySelector("#cart-count");
  const cartTotal = document.querySelector("#cart-total-price");

  if (!cartContainer) return;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cartCount) cartCount.textContent = totalItems;
  if (cartTotal) cartTotal.textContent = `IDR ${totalPrice.toLocaleString("id-ID")}`;

  if (cart.length === 0) {
    cartContainer.innerHTML = `<p style="text-align:center; margin-top:2rem; color: #888;">Keranjang belanja Anda masih kosong.</p>`;
    return;
  }

  cartContainer.innerHTML = "";
  cart.forEach((item, index) => {
    const itemEl = document.createElement("div");
    itemEl.style.cssText = "display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; padding-bottom:0.8rem; border-bottom:1px solid #2a2a2a;";
    itemEl.innerHTML = `
      <div style="flex:1;">
        <h4 style="font-size:0.95rem; margin-bottom:0.2rem; color: #fff;">${item.name}</h4>
        <p style="font-size:0.85rem; color:#b6895b; font-weight: 600;">IDR ${Number(item.price).toLocaleString("id-ID")}</p>
      </div>
      <div style="display:flex; align-items:center; gap:0.6rem;">
        <button type="button" onclick="updateQuantity(${index}, -1)" style="padding:0.2rem 0.6rem; background:#333; color:#fff; border:none; border-radius:0.3rem; cursor:pointer;">-</button>
        <span style="font-weight:600;">${item.quantity}</span>
        <button type="button" onclick="updateQuantity(${index}, 1)" style="padding:0.2rem 0.6rem; background:#333; color:#fff; border:none; border-radius:0.3rem; cursor:pointer;">+</button>
        <button type="button" onclick="removeFromCart(${index})" style="background:none; color:#ff5c5c; margin-left:0.5rem; cursor:pointer; font-size: 1.1rem;" title="Hapus">&times;</button>
      </div>
    `;
    cartContainer.appendChild(itemEl);
  });
}

// ==========================================
// 4. CHECKOUT & WHATSAPP
// ==========================================
const checkoutForm = document.querySelector("#checkoutForm");
if (checkoutForm) {
  checkoutForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Keranjang belanja Anda kosong!");
      return;
    }

    const customerName = document.querySelector("#checkoutName").value.trim();
    const phone = document.querySelector("#checkoutPhone").value.trim();
    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customerName,
          phone: phone,
          total: totalAmount,
          items: cart
        })
      });

      const result = await response.json();

      if (response.ok) {
        const autoOrderId = result.id || Date.now();

        const itemListText = cart
          .map((item) => `- ${item.name} (${item.quantity}x) = IDR ${(item.price * item.quantity).toLocaleString("id-ID")}`)
          .join("\n");

        const waMessage = 
          `Halo Admin Kopi Kenangan Senja,\n\n` +
          `Saya telah melakukan pemesanan dengan rincian berikut:\n` +
          `*Order ID:* #${autoOrderId}\n` +
          `*Nama Pelanggan:* ${customerName}\n` +
          `*No. HP:* ${phone}\n\n` +
          `*Rincian Pesanan:*\n${itemListText}\n\n` +
          `*Total Pembayaran:* IDR ${totalAmount.toLocaleString("id-ID")}\n\n` +
          `Mohon diproses pesanan saya. Terima kasih!`;

        const encodedMessage = encodeURIComponent(waMessage);
        const waUrl = `https://wa.me/${ADMIN_PHONE_NUMBER}?text=${encodedMessage}`;

        alert(`Pesanan #${autoOrderId} berhasil dibuat! Anda akan diarahkan ke WhatsApp.`);

        window.open(waUrl, "_blank");
        clearCart();
        checkoutForm.reset();

        const shoppingCart = document.querySelector(".shopping-cart");
        if (shoppingCart) shoppingCart.classList.remove("active");
      } else {
        alert("Gagal memproses pesanan: " + (result.error || "Terjadi kesalahan"));
      }
    } catch (err) {
      console.error("Gagal melakukan checkout:", err);
      alert("Terjadi kesalahan koneksi ke server backend.");
    }
  });
}

// ==========================================
// 5. FORM KONTAK PELANGGAN
// ==========================================
const contactForm = document.querySelector("#contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.querySelector("#contactName").value.trim();
    const email = document.querySelector("#contactEmail").value.trim();
    const phone = document.querySelector("#contactPhone").value.trim();
    const message = document.querySelector("#contactMessage").value.trim();

    try {
      const response = await fetch(`${API_URL}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message })
      });

      const result = await response.json();

      if (response.ok) {
        alert("Pesan Anda telah berhasil dikirim ke Admin!");
        contactForm.reset();
      } else {
        alert("Gagal mengirim pesan: " + (result.error || "Terjadi kesalahan"));
      }
    } catch (err) {
      console.error("Error mengirim pesan kontak:", err);
      alert("Terjadi kesalahan koneksi ke server backend.");
    }
  });
}

// ==========================================
// 6. TOGGLE NAVBAR, SEARCH, & SHOPPING CART
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
  fetchProducts();
  renderCart();

  const navbarNav = document.querySelector(".navbar-nav");
  const hamburger = document.querySelector("#hamburger-menu");
  const shoppingCart = document.querySelector(".shopping-cart");
  const cartBtn = document.querySelector("#shopping-cart-button");
  const searchForm = document.querySelector("#search-form");
  const searchBtn = document.querySelector("#search-button");

  if (hamburger) {
    hamburger.onclick = (e) => {
      navbarNav.classList.toggle("active");
      if (searchForm) searchForm.classList.remove("active");
      e.preventDefault();
    };
  }

  if (cartBtn) {
    cartBtn.onclick = (e) => {
      shoppingCart.classList.toggle("active");
      e.preventDefault();
    };
  }

  if (searchBtn && searchForm) {
    searchBtn.onclick = (e) => {
      searchForm.classList.toggle("active");
      if (searchForm.classList.contains("active")) {
        document.querySelector("#search-box").focus();
        document.querySelector("#menu").scrollIntoView({ behavior: 'smooth' });
      }
      if (navbarNav) navbarNav.classList.remove("active");
      e.preventDefault();
    };
  }

  document.addEventListener("click", function (e) {
    if (hamburger && navbarNav && !hamburger.contains(e.target) && !navbarNav.contains(e.target)) {
      navbarNav.classList.remove("active");
    }
    if (cartBtn && shoppingCart && !cartBtn.contains(e.target) && !shoppingCart.contains(e.target)) {
      shoppingCart.classList.remove("active");
    }
    if (searchBtn && searchForm && !searchBtn.contains(e.target) && !searchForm.contains(e.target)) {
      searchForm.classList.remove("active");
    }
  });
});