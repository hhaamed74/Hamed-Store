const API = "http://localhost:3000";

// 1. جلب تفاصيل المنتج من السيرفر
async function getProductDetails() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  try {
    const res = await fetch(`${API}/products/${productId}`);
    const data = await res.json();
    const p = data.product ? data.product : data;

    const container = document.getElementById("product-details");
    container.innerHTML = `
                    <div class="details-img">
                        <img src="${p.image}" alt="${p.name}">
                    </div>
                    <div class="details-content">
                        <h1>${p.name}</h1>
                        <span class="price">$${p.price}</span>
                        <p>${p.description}</p>
                        <div style="font-size: 1.6rem; margin-bottom: 2rem;">
                            <strong>Category:</strong> ${p.category} <br>
                            <strong>Status:</strong> ${
                              p.countInStock > 0 ? "In Stock" : "Out of Stock"
                            }
                        </div>
                        
                        <div style="margin-bottom: 2.5rem;">
                            <label style="font-size: 1.6rem; font-weight: bold;">Quantity:</label>
                            <input type="number" id="order-qty" value="1" min="1" max="${
                              p.countInStock
                            }" class="qty-input">
                        </div>

                        <button class="btn-secondary" style="width: 100%; padding: 1.8rem;" 
                                onclick="addToCart('${p._id}', '${p.name}', ${
      p.price
    }, '${p.image}')">
                            Add to Cart 🛒
                        </button>
                    </div>
                `;
  } catch (err) {
    console.error("Fetch Error:", err);
    document.getElementById("product-details").innerHTML =
      "<p>Product not found.</p>";
  }
}

// 2. دالة إضافة المنتج للكارت (LocalStorage)
function addToCart(productId, name, price, image) {
  const qty = parseInt(document.getElementById("order-qty").value);

  // جلب الكارت الحالي
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // البحث لو المنتج موجود مسبقاً
  const existingProduct = cart.find((item) => item.productId === productId);

  if (existingProduct) {
    existingProduct.qty += qty;
  } else {
    cart.push({ productId, name, price, image, qty });
  }

  // حفظ في المتصفح
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();
  alert(`✅ Added ${qty} of ${name} to your cart!`);
}

// 3. تحديث رقم الكارت في الهيدر
function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const count = cart.reduce((total, item) => total + item.qty, 0);
  document.getElementById("cart-count").innerText = count;
}

window.onload = () => {
  getProductDetails();
  updateCartBadge();
};
