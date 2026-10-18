// =====================================================
//  PRODUCTS — put your pics in the SAME folder as index.html
//  and keep the file names below (or change "img" to yours)
//  oldPrice = original price (leave null if no discount)
// =====================================================
const products = [
  // blazer pic here
  { id: 1, name: "Slim Fit Men's Blazer", brand: "Zara", category: "Fashion", price: 89.99, oldPrice: 129.99, rating: 4.5, reviews: 312, img: "blazer.jpg" },
  // sneakers pic here
  { id: 2, name: "Air Max Running Sneakers", brand: "Nike", category: "Shoes", price: 119.0, oldPrice: 150.0, rating: 4.7, reviews: 1204, img: "sneakers.jpg" },
  // headphones pic here
  { id: 3, name: "Wireless Noise Cancelling Headphones", brand: "Sony", category: "Electronics", price: 249.0, oldPrice: 349.0, rating: 4.8, reviews: 2210, img: "headphones.jpg" },
  // watch pic here
  { id: 4, name: "Smart Watch Series 9", brand: "Apple", category: "Electronics", price: 399.0, oldPrice: null, rating: 4.9, reviews: 980, img: "watch.jpg" },
  // hoodie pic here
  { id: 5, name: "Essential Cotton Hoodie", brand: "Adidas", category: "Fashion", price: 45.0, oldPrice: 65.0, rating: 4.3, reviews: 540, img: "hoodie.jpg" },
  // backpack pic here
  { id: 6, name: "Travel Laptop Backpack", brand: "Samsonite", category: "Bags", price: 79.0, oldPrice: null, rating: 4.4, reviews: 220, img: "backpack.jpg" },
  // phone pic here
  { id: 7, name: "Galaxy Smartphone 256GB", brand: "Samsung", category: "Electronics", price: 449.0, oldPrice: 499.0, rating: 4.6, reviews: 1500, img: "phone.jpg" },
  // sunglasses pic here
  { id: 8, name: "Classic Aviator Sunglasses", brand: "Ray-Ban", category: "Accessories", price: 129.0, oldPrice: null, rating: 4.5, reviews: 670, img: "sunglasses.jpg" },
  // jeans pic here
  { id: 9, name: "Straight Fit Denim Jeans", brand: "Levi's", category: "Fashion", price: 49.5, oldPrice: 69.5, rating: 4.2, reviews: 890, img: "jeans.jpg" },
  // boots pic here
  { id: 10, name: "Leather Chelsea Boots", brand: "Clarks", category: "Shoes", price: 139.0, oldPrice: null, rating: 4.6, reviews: 310, img: "boots.jpg" },
  // handbag pic here
  { id: 11, name: "Women's Leather Handbag", brand: "Michael Kors", category: "Bags", price: 179.0, oldPrice: 259.0, rating: 4.7, reviews: 415, img: "handbag.jpg" },
  // speaker pic here
  { id: 12, name: "Portable Bluetooth Speaker", brand: "JBL", category: "Electronics", price: 59.99, oldPrice: 89.99, rating: 4.5, reviews: 1830, img: "speaker.jpg" },
  // perfume pic here
  { id: 13, name: "Eau de Parfum 100ml", brand: "Dior", category: "Accessories", price: 115.0, oldPrice: null, rating: 4.8, reviews: 260, img: "perfume.jpg" },
  // tshirt pic here
  { id: 14, name: "Graphic Cotton T-Shirt", brand: "H&M", category: "Fashion", price: 14.99, oldPrice: 24.99, rating: 4.0, reviews: 720, img: "tshirt.jpg" },
  // laptop pic here
  { id: 15, name: "Ultrabook Laptop 14\"", brand: "Dell", category: "Electronics", price: 489.0, oldPrice: null, rating: 4.4, reviews: 340, img: "laptop.jpg" },
  // running shoes pic here
  { id: 16, name: "Ultraboost Running Shoes", brand: "Adidas", category: "Shoes", price: 129.0, oldPrice: 180.0, rating: 4.7, reviews: 1100, img: "running-shoes.jpg" },
];

// ===== PROMO CODES (fake) =====
const PROMOS = { NEST10: 0.1, SAVE20: 0.2 };
const FREE_SHIPPING_OVER = 50;
const SHIPPING_FEE = 5.99;

// ===== STATE =====
let cart = JSON.parse(localStorage.getItem("cart") || "[]");
let promo = 0;
const state = { search: "", category: "all", brands: [], maxPrice: 500, rating: 0, onlyDiscount: false, sort: "featured" };

// ===== HELPERS =====
const $ = (id) => document.getElementById(id);
const money = (n) => "$" + n.toFixed(2);
const discountPct = (p) => (p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0);
const starStr = (r) => "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));
// shows a grey box with the file name if you haven't added that pic yet
const imgTag = (p, cls = "") =>
  `<img class="${cls}" src="${p.img}" alt="${p.name}" onerror="this.outerHTML='<div class=&quot;placeholder ${cls}&quot;>Add ${p.img}</div>'">`;

function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove("show"), 2000);
}

// ===== BUILD FILTERS & NAV =====
const categories = [...new Set(products.map((p) => p.category))];
const brands = [...new Set(products.map((p) => p.brand))].sort();

$("searchCategory").innerHTML += categories.map((c) => `<option value="${c}">${c}</option>`).join("");
$("catNav").innerHTML =
  `<button class="active" data-cat="all">All</button>` +
  `<button data-cat="deals">🔥 Today's Deals</button>` +
  categories.map((c) => `<button data-cat="${c}">${c}</button>`).join("");
$("brandFilters").innerHTML = brands
  .map((b) => `<label><input type="checkbox" value="${b}" class="brandCb" /> ${b}</label>`)
  .join("");

// ===== RENDER PRODUCTS =====
function getFiltered() {
  const q = state.search.toLowerCase();
  let list = products.filter((p) => {
    if (q && !(p.name + " " + p.brand + " " + p.category).toLowerCase().includes(q)) return false;
    if (state.category === "deals" && !p.oldPrice) return false;
    if (state.category !== "all" && state.category !== "deals" && p.category !== state.category) return false;
    if (state.brands.length && !state.brands.includes(p.brand)) return false;
    if (p.price > state.maxPrice) return false;
    if (p.rating < state.rating) return false;
    if (state.onlyDiscount && !p.oldPrice) return false;
    return true;
  });
  const sorters = {
    low: (a, b) => a.price - b.price,
    high: (a, b) => b.price - a.price,
    rating: (a, b) => b.rating - a.rating,
    discount: (a, b) => discountPct(b) - discountPct(a),
  };
  if (sorters[state.sort]) list = [...list].sort(sorters[state.sort]);
  return list;
}

function renderProducts() {
  const list = getFiltered();
  $("resultCount").textContent = `${list.length} result${list.length !== 1 ? "s" : ""}`;
  $("productGrid").innerHTML = list.length
    ? list
        .map(
          (p, i) => `
      <div class="card" style="animation-delay:${i * 40}ms">
        ${p.oldPrice ? `<span class="sale-tag">-${discountPct(p)}%</span>` : ""}
        <div class="img-wrap">${imgTag(p)}</div>
        <div class="card-body">
          <span class="brand">${p.brand}</span>
          <h3 class="title">${p.name}</h3>
          <div class="stars">${starStr(p.rating)} <span>${p.rating} (${p.reviews})</span></div>
          <div class="price">
            <span class="now">${money(p.price)}</span>
            ${p.oldPrice ? `<span class="old">${money(p.oldPrice)}</span>` : ""}
          </div>
          <button class="btn-primary" data-add="${p.id}">Add to Cart</button>
        </div>
      </div>`
        )
        .join("")
    : `<div class="empty">😕 No products found. Try another search or reset filters.</div>`;
}

// ===== CART =====
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

function addToCart(id) {
  const item = cart.find((c) => c.id === id);
  item ? item.qty++ : cart.push({ id, qty: 1 });
  saveCart();
  const badge = $("cartCount");
  badge.classList.remove("bump");
  void badge.offsetWidth;
  badge.classList.add("bump");
  toast("✓ Added to cart");
}

function totals() {
  const subtotal = cart.reduce((s, c) => s + products.find((p) => p.id === c.id).price * c.qty, 0);
  const disc = subtotal * promo;
  const shipping = subtotal === 0 || subtotal - disc >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;
  return { subtotal, disc, shipping, total: subtotal - disc + shipping };
}

function renderCart() {
  $("cartCount").textContent = cart.reduce((s, c) => s + c.qty, 0);
  $("cartItems").innerHTML = cart.length
    ? cart
        .map((c) => {
          const p = products.find((x) => x.id === c.id);
          return `
        <div class="cart-item">
          ${imgTag(p, "ph")}
          <div class="info">
            <p>${p.name}</p>
            <small>${p.brand} • ${money(p.price)}</small>
            <div class="qty">
              <button data-dec="${p.id}">−</button><span>${c.qty}</span><button data-inc="${p.id}">+</button>
            </div>
          </div>
          <button class="remove" data-remove="${p.id}">Remove</button>
        </div>`;
        })
        .join("")
    : `<div class="empty">🛒 Your cart is empty</div>`;

  const t = totals();
  $("subtotal").textContent = money(t.subtotal);
  $("promoDiscount").textContent = "-" + money(t.disc);
  $("shipping").textContent = t.shipping ? money(t.shipping) : "FREE";
  $("total").textContent = money(t.total);
  $("payBtn").textContent = "Pay " + money(t.total);
  $("checkoutBtn").disabled = !cart.length;
}

function openCart() { $("cartDrawer").classList.add("open"); $("overlay").classList.add("show"); }
function closeCart() { $("cartDrawer").classList.remove("open"); $("overlay").classList.remove("show"); }

// ===== EVENTS =====
document.addEventListener("click", (e) => {
  const d = e.target.dataset;
  if (d.add) {
    addToCart(+d.add);
    e.target.textContent = "✓ Added";
    e.target.classList.add("added");
    setTimeout(() => { e.target.textContent = "Add to Cart"; e.target.classList.remove("added"); }, 1200);
  }
  if (d.inc) { cart.find((c) => c.id === +d.inc).qty++; saveCart(); }
  if (d.dec) {
    const it = cart.find((c) => c.id === +d.dec);
    it.qty--;
    if (it.qty <= 0) cart = cart.filter((c) => c.id !== +d.dec);
    saveCart();
  }
  if (d.remove) { cart = cart.filter((c) => c.id !== +d.remove); saveCart(); }
  if (d.cat) {
    document.querySelectorAll(".catnav button").forEach((b) => b.classList.remove("active"));
    e.target.classList.add("active");
    state.category = d.cat;
    renderProducts();
  }
});

// search (live while typing + button + Enter)
function doSearch() {
  state.search = $("searchInput").value.trim();
  const sc = $("searchCategory").value;
  state.category = sc;
  document.querySelectorAll(".catnav button").forEach((b) => b.classList.toggle("active", b.dataset.cat === sc));
  renderProducts();
}
$("searchInput").addEventListener("input", doSearch);
$("searchBtn").addEventListener("click", () => { doSearch(); document.getElementById("products").scrollIntoView({ behavior: "smooth" }); });
$("searchInput").addEventListener("keydown", (e) => e.key === "Enter" && $("searchBtn").click());
$("searchCategory").addEventListener("change", doSearch);

// filters
document.querySelectorAll(".brandCb").forEach((cb) =>
  cb.addEventListener("change", () => {
    state.brands = [...document.querySelectorAll(".brandCb:checked")].map((x) => x.value);
    renderProducts();
  })
);
$("priceRange").addEventListener("input", (e) => { state.maxPrice = +e.target.value; $("priceLabel").textContent = e.target.value; renderProducts(); });
document.querySelectorAll('input[name="rating"]').forEach((r) => r.addEventListener("change", (e) => { state.rating = +e.target.value; renderProducts(); }));
$("onlyDiscount").addEventListener("change", (e) => { state.onlyDiscount = e.target.checked; renderProducts(); });
$("sortBy").addEventListener("change", (e) => { state.sort = e.target.value; renderProducts(); });
$("resetFilters").addEventListener("click", () => {
  Object.assign(state, { search: "", category: "all", brands: [], maxPrice: 500, rating: 0, onlyDiscount: false, sort: "featured" });
  $("searchInput").value = ""; $("searchCategory").value = "all"; $("priceRange").value = 500; $("priceLabel").textContent = 500;
  $("onlyDiscount").checked = false; $("sortBy").value = "featured";
  document.querySelectorAll(".brandCb").forEach((c) => (c.checked = false));
  document.querySelector('input[name="rating"][value="0"]').checked = true;
  document.querySelectorAll(".catnav button").forEach((b) => b.classList.toggle("active", b.dataset.cat === "all"));
  renderProducts();
});

// cart drawer
$("openCart").addEventListener("click", openCart);
$("closeCart").addEventListener("click", closeCart);
$("overlay").addEventListener("click", closeCart);

// promo
$("applyPromo").addEventListener("click", () => {
  const code = $("promoInput").value.trim().toUpperCase();
  if (PROMOS[code]) { promo = PROMOS[code]; toast(`🎉 ${code} applied: ${PROMOS[code] * 100}% off`); }
  else { promo = 0; toast("❌ Invalid promo code"); }
  renderCart();
});

// ===== DUMMY CHECKOUT / PAYMENT =====
$("checkoutBtn").addEventListener("click", () => {
  closeCart();
  $("checkoutForm").classList.remove("hidden");
  $("successBox").classList.add("hidden");
  $("checkoutModal").classList.add("show");
});
$("closeModal").addEventListener("click", () => $("checkoutModal").classList.remove("show"));

// auto-format card fields
$("cardNumber").addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
});
$("expiry").addEventListener("input", (e) => {
  let v = e.target.value.replace(/\D/g, "").slice(0, 4);
  if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
  e.target.value = v;
});
$("cvv").addEventListener("input", (e) => (e.target.value = e.target.value.replace(/\D/g, "")));

// Luhn check so fake card numbers still "validate" like real ones
function luhn(num) {
  let sum = 0, alt = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = +num[i];
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n; alt = !alt;
  }
  return sum % 10 === 0;
}

$("payForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const err = $("payError");
  const card = $("cardNumber").value.replace(/\s/g, "");
  const [mm, yy] = $("expiry").value.split("/").map(Number);
  const now = new Date();
  const expired = !mm || mm > 12 || 2000 + yy < now.getFullYear() || (2000 + yy === now.getFullYear() && mm < now.getMonth() + 1);

  if (card.length !== 16 || !luhn(card)) return (err.textContent = "Invalid card number (try 4242 4242 4242 4242)");
  if (expired) return (err.textContent = "Card expired or invalid date");
  if ($("cvv").value.length !== 3) return (err.textContent = "CVV must be 3 digits");
  err.textContent = "";

  const btn = $("payBtn");
  btn.disabled = true;
  btn.textContent = "Processing payment...";
  setTimeout(() => {
    btn.disabled = false;
    $("orderId").textContent = "#SN" + Math.floor(100000 + Math.random() * 900000);
    $("checkoutForm").classList.add("hidden");
    $("successBox").classList.remove("hidden");
    cart = []; promo = 0; $("promoInput").value = "";
    e.target.reset();
    saveCart();
  }, 1800);
});
$("continueBtn").addEventListener("click", () => $("checkoutModal").classList.remove("show"));

// ===== START =====
renderProducts();
renderCart();
