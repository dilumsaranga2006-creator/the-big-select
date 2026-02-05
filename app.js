// ====== CONFIG (edit these) ======
const STORE = {
  whatsappNumber: "94741571894",   // Sri Lanka: remove 0, add 94
  emailTo: "thebigselect@gmail.com",
  currency: "LKR ",
  storeName: "The Big Select",
};

// Sample products (replace with your own)
const PRODUCTS = [
  // Phones
  { id: "ph1", name: "Lenovo IdeaPad 1 14AMN7 – Ryzen 5", category: "Phones", price: 179,000.00, tag: "Popular" },
  { id: "ph2", name: "Android Phone (Midrange Series)", category: "Phones", price: 89990, tag: "Best value" },
  { id: "ph3", name: "Refurb iPhone (Certified)", category: "Phones", price: 124990, tag: "Limited" },

  // Accessories
  { id: "ac1", name: "USB-C Fast Charger 20W", category: "Accessories", price: 3490, tag: "New" },
  { id: "ac2", name: "Type-C Cable (Fast Charge)", category: "Accessories", price: 990, tag: "Essential" },
  { id: "ac3", name: "Shockproof Phone Case", category: "Accessories", price: 1490, tag: "Bestseller" },
  { id: "ac4", name: "Wireless Earbuds", category: "Accessories", price: 6990, tag: "Hot" },

  // Gaming
  { id: "ga1", name: "Gaming Mouse (RGB)", category: "Gaming", price: 3990, tag: "Deal" },
  { id: "ga2", name: "Mechanical Keyboard", category: "Gaming", price: 12990, tag: "Pro" },
  { id: "ga3", name: "Gaming Headset", category: "Gaming", price: 8990, tag: "Immersive" },
  { id: "ga4", name: "Controller (Wireless)", category: "Gaming", price: 7490, tag: "Smooth" },

  // Laptops
  { id: "lp1", name: "Lenovo IdeaPad 1 14AMN7 – Ryzen 5", category: "Laptops", price: 179,000, tag: "Reliable" },
  { id: "lp2", name: "HP Victus Gaming 15 Fb3166AX – Ryzen 5", category: "Laptops", price: 250,000, tag: "Performance" },
  { id: "lp3", name: "Lenovo IdeaPad Slim 3 15AMN8 – Ryzen 5", category: "Laptops", price: 189,000, tag: "Power" },

  // Gadgets
  { id: "gd1", name: "Toocki 3.5mm AUX Audio Cable 2M", category: "Gadgets", price: 2200, tag: "Loud" },
  { id: "gd2", name: "20W USB-C Power Adapter ", category: "Gadgets", price: 4500, tag: "Trending" },
  { id: "gd3", name: "K9 Dual Wireless Clip Microphone – Type-C & Lightning", category: "Gadgets", price: 3250, tag: "Must have" },
];

// ====== STATE ======
const CART_KEY = "techstore_cart_v1";
let cart = loadCart();

const el = (id) => document.getElementById(id);

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function money(n) {
  return `${STORE.currency}${n.toFixed(2)}`;
}

// ====== UI: PRODUCTS ======
function uniqueCategories() {
  return Array.from(new Set(PRODUCTS.map(p => p.category))).sort();
}

function renderCategorySelect() {
  const select = el("categorySelect");
  uniqueCategories().forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
}

function productMatches(p, q, cat) {
  const qq = q.trim().toLowerCase();
  const matchQ = !qq || p.name.toLowerCase().includes(qq) || p.category.toLowerCase().includes(qq);
  const matchCat = (cat === "all") || (p.category === cat);
  return matchQ && matchCat;
}

function renderProducts() {
  const grid = el("productGrid");
  const q = el("searchInput").value || "";
  const cat = el("categorySelect").value || "all";

  grid.innerHTML = "";
  const filtered = PRODUCTS.filter(p => productMatches(p, q, cat));

  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "card";
    empty.innerHTML = `<div class="thumb">No results</div><div class="muted">Try another search.</div>`;
    grid.appendChild(empty);
    return;
  }

  filtered.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="thumb">${p.category}</div>
      <div class="meta">
        <span>${p.tag}</span>
        <span class="price">${money(p.price)}</span>
      </div>
      <h3>${p.name}</h3>
      <div class="actions">
        <button class="btn ghost" data-action="details" data-id="${p.id}">Details</button>
        <button class="btn primary" data-action="add" data-id="${p.id}">Add to cart</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ====== CART ======
function cartCount() {
  return Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
}
function cartSubtotal() {
  return Object.values(cart).reduce((sum, item) => sum + item.qty * item.price, 0);
}
function setCartCount() {
  el("cartCount").textContent = String(cartCount());
}
function addToCart(productId) {
  const p = PRODUCTS.find(x => x.id === productId);
  if (!p) return;

  cart[productId] = cart[productId] || { id: p.id, name: p.name, price: p.price, qty: 0 };
  cart[productId].qty += 1;

  saveCart();
  setCartCount();
  renderCart();
}
function changeQty(productId, delta) {
  if (!cart[productId]) return;
  cart[productId].qty += delta;
  if (cart[productId].qty <= 0) delete cart[productId];
  saveCart();
  setCartCount();
  renderCart();
}
function clearCart() {
  cart = {};
  saveCart();
  setCartCount();
  renderCart();
}

function renderCart() {
  const wrap = el("cartItems");
  wrap.innerHTML = "";

  const items = Object.values(cart);
  if (items.length === 0) {
    wrap.innerHTML = `<div class="muted">Your cart is empty.</div>`;
    el("cartSubtotal").textContent = money(0);
    return;
  }

  items.forEach(item => {
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div>
        <strong>${item.name}</strong>
        <div class="muted">${money(item.price)} • Qty: ${item.qty}</div>
      </div>
      <div class="qty">
        <button aria-label="Decrease" data-action="dec" data-id="${item.id}">−</button>
        <button aria-label="Increase" data-action="inc" data-id="${item.id}">+</button>
      </div>
    `;
    wrap.appendChild(row);
  });

  el("cartSubtotal").textContent = money(cartSubtotal());
}

function buildOrderMessage() {
  const name = (el("customerName").value || "").trim();
  const loc = (el("customerLocation").value || "").trim();
  const phone = (el("customerPhone").value || "").trim();

  const items = Object.values(cart);
  const lines = [];
  lines.push(`Order for: ${STORE.storeName}`);
  if (name) lines.push(`Name: ${name}`);
  if (loc) lines.push(`Location: ${loc}`);
  if (phone) lines.push(`Phone: ${phone}`);
  lines.push("");
  lines.push("Items:");
  items.forEach(i => lines.push(`- ${i.name} x${i.qty} = ${money(i.qty * i.price)}`));
  lines.push("");
  lines.push(`Subtotal: ${money(cartSubtotal())}`);
  lines.push("");
  lines.push("Please confirm availability and delivery time.");
  return lines.join("\n");
}

function checkoutWhatsApp() {
  if (cartCount() === 0) return alert("Cart is empty.");
  const msg = encodeURIComponent(buildOrderMessage());
  const url = `https://wa.me/${STORE.whatsappNumber}?text=${msg}`;
  window.open(url, "_blank");
}
function checkoutEmail() {
  if (cartCount() === 0) return alert("Cart is empty.");
  const subject = encodeURIComponent(`Order - ${STORE.storeName}`);
  const body = encodeURIComponent(buildOrderMessage());
  const url = `mailto:${STORE.emailTo}?subject=${subject}&body=${body}`;
  window.location.href = url;
}

// ====== CART DRAWER ======
function openCart() {
  el("overlay").hidden = false;
  el("cart").classList.add("open");
  el("cart").setAttribute("aria-hidden", "false");
}
function closeCart() {
  el("overlay").hidden = true;
  el("cart").classList.remove("open");
  el("cart").setAttribute("aria-hidden", "true");
}

// ====== EVENTS ======
document.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const action = btn.dataset.action;
  const id = btn.dataset.id;

  if (action === "add") addToCart(id);
  if (action === "details") {
    const p = PRODUCTS.find(x => x.id === id);
    if (p) alert(`${p.name}\nCategory: ${p.category}\nPrice: ${money(p.price)}\nTag: ${p.tag}`);
  }
  if (action === "inc") changeQty(id, +1);
  if (action === "dec") changeQty(id, -1);
});

el("openCartBtn").addEventListener("click", () => { renderCart(); openCart(); });
el("closeCartBtn").addEventListener("click", closeCart);
el("overlay").addEventListener("click", closeCart);

el("clearCartBtn").addEventListener("click", clearCart);
el("checkoutWhatsApp").addEventListener("click", checkoutWhatsApp);
el("checkoutEmail").addEventListener("click", checkoutEmail);

el("searchInput").addEventListener("input", renderProducts);
el("categorySelect").addEventListener("change", renderProducts);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeCart();
});

// ====== INIT ======
el("year").textContent = String(new Date().getFullYear());
renderCategorySelect();
renderProducts();
setCartCount();
renderCart();
