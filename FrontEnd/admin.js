const API = "http://localhost:3000/products";
const token = localStorage.getItem("token"); // جلب التوكن

// 0. حماية الصفحة
if (localStorage.getItem("userRole") !== "admin") {
  alert("Unauthorized! Admins only.");
  window.location.href = "index.html";
}

// 1. جلب المنتجات وعرضها للحذف
async function loadAdminProducts() {
  try {
    const res = await fetch(API);
    const data = await res.json();
    const list = document.getElementById("admin-products-list");

    // التأكد من جلب المنتجات سواء كانت في data.products أو data مباشرة
    const products = data.products || data;

    list.innerHTML = products
      .map(
        (p) => `
        <div class="admin-list-item">
            <img src="${p.image}" alt="">
            <div style="flex:1; margin-left: 1.5rem;">
                <h4 style="font-size:1.4rem">${p.name}</h4>
                <p style="color:red">$${p.price}</p>
            </div>
            <button class="btn-delete" onclick="deleteProduct('${p._id}')">Delete</button>
        </div>
    `
      )
      .join("");
  } catch (err) {
    console.error("Error loading products:", err);
  }
}

// 2. إضافة منتج جديد (تم إضافة الـ Authorization)
document
  .getElementById("add-product-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const newProduct = {
      name: document.getElementById("p-name").value,
      price: document.getElementById("p-price").value,
      image: document.getElementById("p-image").value,
      category: document.getElementById("p-category").value,
      countInStock: document.getElementById("p-stock").value,
      description: document.getElementById("p-desc").value,
    };

    const res = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // السطر الجديد والمهم
      },
      body: JSON.stringify(newProduct),
    });

    if (res.ok) {
      alert("Product Added Successfully! ✨");
      document.getElementById("add-product-form").reset();
      loadAdminProducts();
    } else {
      alert("Failed to add product. Check if you are admin.");
    }
  });

// 3. حذف منتج (تم إضافة الـ Authorization)
async function deleteProduct(id) {
  if (confirm("Are you sure you want to delete this product?")) {
    const res = await fetch(`${API}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`, // السطر الجديد والمهم
      },
    });

    if (res.ok) {
      loadAdminProducts();
    } else {
      alert("Error deleting product.");
    }
  }
}

window.onload = loadAdminProducts;
