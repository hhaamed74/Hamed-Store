const API = "http://localhost:3000";

// 1. عرض المنتجات في الكارت
function displayCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const container = document.getElementById("cart-items");
  let total = 0;

  if (cart.length === 0) {
    container.innerHTML = `
            <div style="text-align:center; padding: 5rem;">
                <p style="font-size: 1.8rem; color: #64748b;">Your cart is empty.</p>
                <a href="index.html" style="display:inline-block; margin-top:2rem; font-size:1.5rem; color:red;">Start Shopping →</a>
            </div>`;
    updateTotals(0);
    return;
  }

  container.innerHTML = cart
    .map((item, index) => {
      total += item.price * item.qty;
      return `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p>Qty: ${item.qty}</p>
                    <button class="btn-remove" onclick="removeItem(${index})">Remove Item</button>
                </div>
                <div class="item-price">$${(item.price * item.qty).toFixed(
                  2
                )}</div>
            </div>
        `;
    })
    .join("");

  updateTotals(total);
}

function updateTotals(total) {
  document.getElementById("subtotal").innerText = `$${total.toFixed(2)}`;
  document.getElementById("final-total").innerText = `$${total.toFixed(2)}`;
}

// 2. حذف منتج
function removeItem(index) {
  let cart = JSON.parse(localStorage.getItem("cart"));
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
}

// 3. إتمام الشراء (Checkout)
async function processCheckout() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login first to place an order!");
    window.location.href = "index.html";
    return;
  }

  if (cart.length === 0) return alert("Your cart is empty!");

  // تجهيز البيانات للسيرفر
  const orderData = {
    products: cart.map((item) => ({
      productId: item.productId,
      qty: item.qty,
    })),
  };

  try {
    const res = await fetch(`${API}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });

    if (res.ok) {
      alert("Order Placed Successfully! 🎉");
      localStorage.removeItem("cart"); // مسح الكارت بعد النجاح
      window.location.href = "index.html"; // الرجوع للرئيسية
    } else {
      const error = await res.json();
      alert("Error: " + error.message);
    }
  } catch (err) {
    console.error("Checkout Failed:", err);
  }
}

window.onload = displayCart;
