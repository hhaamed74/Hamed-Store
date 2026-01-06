const API = "https://hamed-store.vercel.app/";

// --- 1. تحديث الواجهة (تبديل الأقسام بناءً على حالة تسجيل الدخول) ---
function toggleUI(isLoggedIn) {
  const authSec = document.getElementById("auth-sec");
  const productsSec = document.getElementById("products-sec");
  const ordersSec = document.getElementById("orders-sec");
  const navLogout = document.getElementById("nav-logout");
  const navLogin = document.getElementById("nav-login");

  if (isLoggedIn) {
    if (authSec) authSec.classList.add("hidden");
    if (productsSec) productsSec.classList.remove("hidden");
    if (ordersSec) ordersSec.classList.remove("hidden");
    if (navLogout) navLogout.classList.remove("hidden");
    if (navLogin) navLogin.classList.add("hidden");
    checkAdminLink(); // فحص صلاحيات الإدارة فور تسجيل الدخول
  } else {
    if (authSec) authSec.classList.remove("hidden");
    if (productsSec) productsSec.classList.add("hidden");
    if (ordersSec) ordersSec.classList.add("hidden");
    if (navLogout) navLogout.classList.add("hidden");
    if (navLogin) navLogin.classList.remove("hidden");
  }
}

// --- 2. جلب المنتجات وعرضها ---
async function fetchProducts() {
  try {
    const res = await fetch(`${API}/products`);
    const data = await res.json();
    const products = data.products;
    const container = document.getElementById("products");

    if (!container) return;

    container.innerHTML = products
      .map(
        (p) => `
            <div class="product">
                <a href="product-details.html?id=${p._id}" style="text-decoration:none; color:inherit;">
                    <div class="img-wrapper"><img src="${p.image}" alt="${p.name}"></div>
                    <h3>${p.name}</h3>
                </a>
                <span class="price-tag">$${p.price}</span>
                <button onclick="createOrder('${p._id}')">Order Now</button>
            </div>
        `
      )
      .join("");
  } catch (err) {
    console.error("Error fetching products:", err);
  }
}

// --- دالة التسجيل (تعديل لتناسب الـ IDs في الـ HTML بتاعك) ---
async function register() {
  const nameInput = document.getElementById("name"); // مطابق للـ HTML
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!name || !email || !password) {
    return alert("يرجى ملء جميع البيانات (الاسم، الإيميل، الباسورد)");
  }

  try {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      alert("تم إنشاء الحساب بنجاح! سجل دخول دلوقتي");
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error(err);
  }
}

// --- دالة تسجيل الدخول (تعديل لتناسب الـ IDs في الـ HTML بتاعك) ---
async function login() {
  const emailInput = document.getElementById("email"); // مطابق للـ HTML
  const passwordInput = document.getElementById("password");

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    return alert("اكتب الإيميل والباسورد يا بطل");
  }

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userRole", data.user.role);

      toggleUI(true);
      fetchOrders();
      alert("أهلاً بك: " + data.user.name);
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error(err);
  }
}
// --- 4. فحص رابط الإدارة (للمسؤولين فقط) ---
function checkAdminLink() {
  const role = localStorage.getItem("userRole");
  const adminLink = document.getElementById("admin-link");
  if (role === "admin" && adminLink) {
    adminLink.classList.remove("hidden");
  }
}

// --- 5. عمل طلب جديد ---
async function createOrder(productId) {
  const token = localStorage.getItem("token");
  if (!token) return alert("Please login first!");

  try {
    const res = await fetch(`${API}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ products: [{ productId, qty: 1 }] }),
    });

    if (res.ok) {
      alert("Order success! 🚀");
      fetchOrders();
    } else {
      alert("Failed to create order.");
    }
  } catch (err) {
    console.error("Order error:", err);
  }
}

// --- 6. جلب طلبات المستخدم الحالي ---
async function fetchOrders() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetch(`${API}/orders/my-orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const orders = await res.json();
    const container = document.getElementById("orders");

    if (!container) return;

    if (orders.length === 0) {
      container.innerHTML = "<p>No orders found.</p>";
      return;
    }

    container.innerHTML = orders
      .map(
        (o) => `
            <div class="order">
                <div class="order-info">
                    <h4>ORDER ID: ${o._id.substring(0, 10)}...</h4>
                    <p style="font-size:1.8rem; font-weight:800; margin-top:0.5rem">
                        Total: $${o.total}
                    </p>
                </div>
                <div class="order-status">${o.status}</div>
            </div>
        `
      )
      .join("");
  } catch (err) {
    console.error("Fetch orders error:", err);
  }
}

// --- 7. تسجيل الخروج ---
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
  location.reload();
}

// --- 8. عند تحميل الصفحة ---
window.onload = () => {
  fetchProducts();
  if (localStorage.getItem("token")) {
    toggleUI(true);
    fetchOrders();
  } else {
    toggleUI(false);
  }
};
