// =====================================================
// PUSHAPA JEWELLERS - COMPLETE SCRIPT.JS
// =====================================================


// ================= CART FUNCTIONS =================

function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
}
function updateCartCount() {
    const cart = getCart();

    const cartCount = document.getElementById("cart-count");

    if (cartCount) {
        cartCount.textContent = cart.length;
    }
}


// ================= ADD TO CART =================

function addToCart(product) {
    if (!product) return;

    const cart = getCart();

    const image = product.image || "";
    const name = product.name || "Jewellery Product";

    const priceValue = Number(
        String(product.price || 0).replace(/[^0-9.]/g, "")
    );

    const existing = cart.find(
        item => item.name === name && item.image === image
    );

    if (existing) {
        existing.quantity = (Number(existing.quantity) || 1) + 1;
    } else {
        cart.push({
            name: name,
            image: image,
            price: priceValue,
            quantity: 1
        });
    }

    saveCart(cart);
   showCartAlert();
}


// ================= CART BUTTON HANDLER =================

document.addEventListener("click", function (event) {
    const button = event.target.closest(".cart-btn");

    if (!button) return;

    const card = button.closest(".card, .product-card");

    if (!card) return;

    const imageElement = card.querySelector("img");
    const nameElement = card.querySelector(
        ".product-name, h3, h2"
    );
    const priceElement = card.querySelector(".price");

    const product = {
        name:
            button.dataset.name ||
            nameElement?.textContent.trim() ||
            "Jewellery Product",

        image:
            button.dataset.image ||
            imageElement?.getAttribute("src") ||
            imageElement?.src ||
            "",

        price:
            button.dataset.price ||
            priceElement?.textContent.trim() ||
            "0"
    };

    addToCart(product);

    const originalText = button.textContent;
    button.textContent = "Added ✓";

    setTimeout(function () {
        button.textContent = originalText;
    }, 1200);
});


// ================= DISPLAY CART =================

document.addEventListener("DOMContentLoaded", function () {
    updateCartCount();

    const cartContainer = document.getElementById("cart-items");

    if (!cartContainer) return;

    renderCart();
});

function renderCart() {
    const cartContainer = document.getElementById("cart-items");

    if (!cartContainer) return;

    const cart = getCart();

    let total = 0;

    if (cart.length === 0) {
        cartContainer.innerHTML = "<p>Your cart is empty.</p>";
    } else {
        cartContainer.innerHTML = cart.map(function (item, index) {
            const price = Number(
                String(item.price || 0).replace(/[^0-9.]/g, "")
            );

            const quantity = Number(item.quantity) || 1;

            total += price * quantity;

            return `
                <div class="cart-card">
                    <img
                        src="${item.image || "images/logo.png"}"
                        alt="${item.name || "Jewellery"}"
                        width="150"
                    >

                    <h3>${item.name || "Jewellery Product"}</h3>

                    <p>Price: ₹${price}</p>

                    <p>Quantity: ${quantity}</p>

                    <p>Subtotal: ₹${price * quantity}</p>

                    <button
                        type="button"
                        onclick="removeItem(${index})"
                    >
                        Remove
                    </button>
                </div>
            `;
        }).join("");
    }

    const totalPrice = document.getElementById("total-price");

    if (totalPrice) {
        totalPrice.textContent = "₹" + total;
    }

    updateCartCount();
}


// ================= REMOVE FROM CART =================

function removeItem(index) {
    const cart = getCart();

    cart.splice(index, 1);

    saveCart(cart);
    renderCart();
}


// ================= SEARCH PRODUCT =================

function searchProduct() {
    const input =
        document.getElementById("jewellerySearch") ||
        document.getElementById("searchInput");

    if (input) {
        input.dispatchEvent(new Event("input"));
    }
}


// ================= NORMALIZE CATEGORY =================

function normalizeCategory(value) {

    let category = String(value || "")
        .toLowerCase()
        .trim();

    category = category
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ");

    if (
        category.includes("ring")
    ) {
        return "ring";
    }

    if (
        category.includes("necklace")
    ) {
        return "necklace";
    }

    if (
        category.includes("earring")
    ) {
        return "earring";
    }

    if (
        category.includes("bracelet")
    ) {
        return "bracelet";
    }

    if (
        category.includes("bangle")
    ) {
        return "bangle";
    }

    if (
        category.includes("chain")
    ) {
        return "chain";
    }

    if (
        category.includes("pendant")
    ) {
        return "pendant";
    }

    if (
        category.includes("mangalsutra") ||
        category.includes("mangal sutra")
    ) {
        return "mangalsutra";
    }

    if (category === "all") {
        return "all";
    }

    return category;
}
// ================= NORMALIZE PURITY =================

function normalizePurity(value) {
    return String(value || "")
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[^a-z0-9]/g, "");
}
// =====================================================
// PRODUCT CARDS - LUXURY BLACK & GOLD
// =====================================================

function displayProducts(products) {

    const container = document.getElementById("product-container");

    if (!container) return;

    container.innerHTML = "";

    if (!products || products.length === 0) {

        const noProducts = document.getElementById("noProductsMessage");

        if (noProducts) {
            noProducts.style.display = "block";
        }

        return;
    }

    const noProducts = document.getElementById("noProductsMessage");

    if (noProducts) {
        noProducts.style.display = "none";
    }


    products.forEach(function(product) {

        const card = document.createElement("div");

        card.className = "product-card";
        card.dataset.name = String(
    product.name || product.title || "Jewellery Product"
);

card.dataset.category = String(
    product.category || product.type || "jewellery"
);

card.dataset.price = Number(product.price) || 0;

card.dataset.purity = String(
    product.purity ||
    product.karat ||
    product.goldPurity ||
    ""
);


        // IMAGE
        let image = product.image || "";

        if (
            image &&
            !image.startsWith("http") &&
            !image.startsWith("/") &&
            !image.startsWith("data:")
        ) {
            image = "https://pushapa-jewellers.onrender.com/" + image;
        }


        // NAME
        let displayName =
            product.name ||
            product.title ||
            "Jewellery Product";

        // Ring1 / Ring 1 / Ring-1 remove
        displayName = displayName
            .replace(/\s*[-#]?\s*\d+\s*$/, "")
            .trim();


        // CATEGORY
        let categoryText =
            product.category ||
            product.type ||
            "Jewellery";


        categoryText =
            categoryText.charAt(0).toUpperCase() +
            categoryText.slice(1);


        // PRICE
        let price = Number(product.price) || 0;


        let purity =
    product.purity ||
    product.karat ||
    product.goldPurity ||
    "22K";

let weight =
    product.weight ||
    product.gram ||
    product.grams ||
    product.goldWeight ||
    "4.2g";

purity = String(purity).trim();
weight = String(weight).trim();

if (!weight.toLowerCase().endsWith("g")) {
    weight += "g";
}


        // CARD
        card.innerHTML = `

            <div class="product-image-wrap">

                <img
                    src="${image}"
                    alt="${displayName}"
                    loading="lazy"
                    onerror="this.src='images/logo.png'"
                >

            </div>


            <div class="product-card-content">


                <div class="product-category">
                    ${categoryText}
                </div>


                <h3 class="product-name">
                    ${displayName}
                </h3>


                <div class="product-rating">

                    <span class="stars">
                        ★★★★★
                    </span>

                    <span class="rating-number">
                        5.0
                    </span>

                </div>


                
                    ₹${price.toLocaleString("en-IN")}
                </p>


                <div class="product-buttons">

                    <button
                        class="view-btn"
                        type="button"
                    >
                        View Details
                    </button>


                    <button
                        class="cart-btn"
                        type="button"
                        data-name="${product.name || "Jewellery Product"}"
                        data-price="${price}"
                        data-image="${image}"
                    >
                        Add to Cart
                    </button>

                </div>

            </div>

        `;


        // VIEW DETAILS
        const viewButton =
            card.querySelector(".view-btn");

        if (viewButton) {

            viewButton.addEventListener("click", function() {

                localStorage.setItem(
                    "selectedProduct",
                    JSON.stringify(product)
                );

                window.location.href =
                    "view-details.html";

            });

        }


        container.appendChild(card);

    });


    // KEEP EXISTING FILTERS WORKING
    if (typeof window.applyJewelleryFilters === "function") {
        window.applyJewelleryFilters();
    }


    // KEEP WISHLIST WORKING
    if (typeof loadWishlistStatus === "function") {
        loadWishlistStatus();
    }

}


// ================= WISHLIST =================

function getWishlist() {
    return JSON.parse(localStorage.getItem("wishlist")) || [];
}

function toggleWishlist(button, name, image, price) {
    let wishlist = getWishlist();

    const index = wishlist.findIndex(function (item) {
        return item.image === image;
    });

    if (index !== -1) {
        wishlist.splice(index, 1);
    } else {
        wishlist.push({
            name: name,
            image: image,
            price: price
        });
    }

    localStorage.setItem(
        "wishlist",
        JSON.stringify(wishlist)
    );

    loadWishlistStatus();
}

function loadWishlistStatus() {
    const wishlist = getWishlist();

    document.querySelectorAll(".wishlist-btn").forEach(function (button) {
        const card = button.closest(".card, .product-card");
        const imageElement = card?.querySelector("img");

        if (!imageElement) return;

        const image = imageElement.getAttribute("src");

        const exists = wishlist.some(function (item) {
            return item.image === image ||
                item.image === imageElement.src;
        });

        button.classList.toggle("active", exists);

        button.innerHTML = exists
            ? '<i class="fa-solid fa-heart"></i>'
            : '<i class="fa-regular fa-heart"></i>';
    });
}


// ================= LOGIN =================

async function loginUser(event) {

    event.preventDefault();

    const email =
        document.getElementById("email")?.value.trim() || "";

    const password =
        document.getElementById("password")?.value || "";

    if (!email || !password) {
        alert("Please enter email and password.");
        return;
    }

    try {

        const response = await fetch(
            "https://pushapa-jewellers.onrender.com/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const data = await response.json();

        console.log("LOGIN RESPONSE:", data);

        if (!response.ok) {
            alert(data.message || "Invalid Email or Password");
            return;
        }

        // ================= ADMIN =================

        if (data.role === "admin") {

            localStorage.setItem("adminLogin", "true");
            localStorage.setItem("login", "true");

            showPremiumAlert("Admin Login Successful!");

            window.location.href = "admin.html";

            return;
        }

        // ================= NORMAL USER =================

        if (data.role === "user") {

            localStorage.setItem("login", "true");

            if (data.userId) {
                localStorage.setItem(
                    "userId",
                    data.userId
                );
            }

            showPremiumAlert("Login Successful!");

            window.location.href = "product.html";

            return;
        }

        alert("Invalid login response.");

    } catch (error) {

        console.error("LOGIN ERROR:", error);

        alert("Server connection failed");
    }
}


// ================= LOGOUT =================

function logout() {
    localStorage.removeItem("login");
    localStorage.removeItem("userId");
    localStorage.removeItem("user");

    alert("Logout Successfully");

    window.location.href = "login.html";
}


// ================= ADMIN LOGIN =================

function adminLogin() {
    const email = document.getElementById("adminEmail").value;
    const password = document.getElementById("adminPassword").value;

    if (email === "admin@gmail.com" && password === "admin123") {
        localStorage.setItem("adminLogin", "true");
        window.location.href = "admin.html";
    } else {
        alert("Invalid Admin Login");
    }
}


// ================= BUY NOW =================

function buyNow(button) {
    const productCard = button.closest(".card, .product-card");

    if (!productCard) {
        alert("Product not found!");
        return;
    }

    const imageElement = productCard.querySelector("img");
    const priceElement = productCard.querySelector(".price");
    const nameElement = productCard.querySelector(
        ".product-name, h3, h2"
    );

    const product = {
        image: imageElement?.src || "",
        name: nameElement?.textContent.trim() || "Jewellery Product",
        price: priceElement?.textContent.trim() || "₹0"
    };

    localStorage.setItem(
        "selectedProduct",
        JSON.stringify(product)
    );

    window.location.href = "buy-now.html";
}


// ================= LOAD BUY NOW PRODUCT =================

document.addEventListener("DOMContentLoaded", function () {
    const productData = localStorage.getItem("selectedProduct");

    if (!productData) return;

    let product;

    try {
        product = JSON.parse(productData);
    } catch (error) {
        console.error("Invalid selected product:", error);
        return;
    }

    const fields = [
        ["product-image", product.image, "src"],
        ["summary-image", product.image, "src"],
        ["product-name", product.name, "textContent"],
        ["summary-name", product.name, "textContent"],
        ["product-price", product.price, "textContent"],
        ["summary-price", product.price, "textContent"]
    ];

    fields.forEach(function ([id, value, property]) {
        const element = document.getElementById(id);

        if (element && value) {
            element[property] = value;
        }
    });
});


// ================= PLACE ORDER =================

async function placeOrder() {

    const getValue = id =>
        document.getElementById(id)?.value.trim() || "";

    const name = getValue("name");
    const mobile = getValue("mobile");
    const email = getValue("email");
    const address = getValue("address");
    const city = getValue("city");
    const pincode = getValue("pincode");

    // ================= VALIDATION =================

    if (!name) {
        alert("Please enter your full name.");
        document.getElementById("name")?.focus();
        return;
    }

    if (!/^[6-9][0-9]{9}$/.test(mobile)) {
        alert("Please enter valid 10 digit mobile number.");
        document.getElementById("mobile")?.focus();
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert("Please enter valid email address.");
        document.getElementById("email")?.focus();
        return;
    }

    if (!address) {
        alert("Please enter your address.");
        document.getElementById("address")?.focus();
        return;
    }

    if (!city) {
        alert("Please enter your city.");
        document.getElementById("city")?.focus();
        return;
    }

    if (!/^[0-9]{6}$/.test(pincode)) {
        alert("Please enter valid 6 digit PIN code.");
        document.getElementById("pincode")?.focus();
        return;
    }

    // ================= PRODUCT DATA =================

    const productName =
        document.getElementById("product-name")?.textContent.trim()
        || "Jewellery Product";

    const productImage =
        document.getElementById("product-image")?.src || "";

    const productPriceText =
        document.getElementById("product-price")?.textContent.trim()
        || "₹0";

    const totalText =
        document.getElementById("total")?.textContent.trim()
        || productPriceText;

    // Convert ₹45,999 -> 45999
    const productPrice =
        Number(productPriceText.replace(/[^0-9.]/g, "")) || 0;

    const total =
        Number(totalText.replace(/[^0-9.]/g, "")) || productPrice;

    // ================= PAYMENT =================

    const paymentElement =
        document.querySelector('input[name="payment"]:checked');

    const payment =
        paymentElement && paymentElement.value === "online"
            ? "Online Payment"
            : "Cash on Delivery";

    // ================= ORDER ID =================

    const orderId =
        "PJ" + Date.now().toString().slice(-8);

    // ================= ORDER OBJECT =================

    const order = {

        orderId: orderId,

        customerName: name,

        mobile: mobile,

        email: email,

        address: address,

        city: city,

        pincode: pincode,

        productName: productName,

        productPrice: productPrice,

        paymentMethod: payment,

        status: "Placed"

    };

    // ================= SAVE TO MONGODB =================

    try {

        const response = await fetch(
            "https://pushapa-jewellers.onrender.com/orders",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(order)
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {

            console.error("ORDER SAVE ERROR:", data);

            alert(
                data.message ||
                "Order could not be placed. Please try again."
            );

            return;
        }

        // ================= LOCAL ORDER =================

        const localOrder = {

            orderId: orderId,

            orderDate: new Date().toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            ),

            status: "Placed",

            customer: {

                name: name,
                mobile: mobile,
                email: email,
                address: address,
                city: city,
                pincode: pincode

            },

            product: {

                name: productName,
                image: productImage,
                price: productPriceText,
                quantity: 1

            },

            payment: payment,

            total: totalText

        };

        localStorage.setItem(
            "latestOrder",
            JSON.stringify(localOrder)
        );

        const orders =
            JSON.parse(localStorage.getItem("orders")) || [];

        orders.push(localOrder);

        localStorage.setItem(
            "orders",
            JSON.stringify(orders)
        );

        // ================= SUCCESS =================

        showPremiumAlert("Order Placed Successfully!");

        window.location.href = "order-success.html";

    }

    catch (error) {

        console.error("PLACE ORDER ERROR:", error);

        alert(
            "Server connection failed. Please make sure your backend server is running."
        );

    }

}

// ================= GOOGLE LOGIN =================

function initializeGoogleLogin() {
    const googleBtn = document.getElementById("googleLoginBtn");

    if (!googleBtn) return;

    if (!window.google?.accounts?.id) {
        googleBtn.textContent =
            "Google Login could not load. Refresh the page.";
        return;
    }

    google.accounts.id.initialize({
        client_id:
            "4208375359-8b8p8tuujerr4g05153epvaf1cs3mj9n.apps.googleusercontent.com",
        callback: handleGoogleLogin
    });

    google.accounts.id.renderButton(googleBtn, {
        type: "standard",
        theme: "filled_black",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        logo_alignment: "left",
        width: 320
    });
}

window.addEventListener("load", initializeGoogleLogin);


async function handleGoogleLogin(response) {
    if (!response || !response.credential) {
        alert("Google login failed. Please try again.");
        return;
    }

    try {
        const res = await fetch(
            "https://pushapa-jewellers.onrender.com/api/auth/google",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    credential: response.credential
                })
            }
        );

        const data = await res.json();

        if (!res.ok || data.status !== "success") {
            throw new Error(
                data.message || "Google authentication failed."
            );
        }

        localStorage.setItem("login", "true");

        if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
        }

        if (data.userId) {
            localStorage.setItem("userId", data.userId);
        }

        showPremiumAlert("Google Login Successful!");
        window.location.href = "index.html";

    } catch (error) {
        console.error("Google Login Error:", error);
        alert(error.message || "Something went wrong.");
    }
}


// ================= LOGIN PROTECTION =================

document.addEventListener("DOMContentLoaded", function () {
    const protectedPages = [
    "product.html",
    "about.html",
    "contact.html",
    "cart.html",
    "wishlist.html",
    "my-orders.html"
];

    const currentPage = window.location.pathname
        .split("/")
        .pop();

    if (
        protectedPages.includes(currentPage) &&
        localStorage.getItem("login") !== "true"
    ) {
        window.location.href = "login.html";
    }
});


// ================= MENU =================

document.addEventListener("DOMContentLoaded", function () {
    const menuBtn = document.querySelector(".menu-btn");
    const navLinks = document.querySelector(".nav-links");

    if (menuBtn && navLinks) {
        menuBtn.addEventListener("click", function () {
            navLinks.classList.toggle("active");
        });
    }
});


// ================= SCROLL TO TOP =================

window.addEventListener("load", function () {
    window.scrollTo(0, 0);
});


// ================= SCROLL ANIMATIONS =================

document.addEventListener("DOMContentLoaded", function () {
    const boxes = document.querySelectorAll(
        ".choose-box, .feature-card, .why-card, .arrival-card, .review-card"
    );

    boxes.forEach(function (box) {
        box.style.opacity = "0";
        box.style.transform = "translateY(40px)";
        box.style.transition = "0.6s ease";
    });

    function showBoxes() {
        boxes.forEach(function (box) {
            const position = box.getBoundingClientRect().top;

            if (position < window.innerHeight - 100) {
                box.style.opacity = "1";
                box.style.transform = "translateY(0)";
            }
        });
    }

    window.addEventListener("scroll", showBoxes);
    showBoxes();
});


// =====================================================
// PUSHAPA JEWELLERS
// PRODUCT SEARCH + FILTER + SORT + LOAD
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    const container = document.getElementById("product-container");

    if (!container) return;

    const searchInput =
        document.getElementById("jewellerySearch");

    const categoryFilter =
        document.getElementById("categoryFilter");

    const priceFilter =
        document.getElementById("priceFilter");

    const purityFilter =
        document.getElementById("purityFilter");

    const sortFilter =
        document.getElementById("sortFilter");

    const clearSearch =
        document.getElementById("clearSearch");

    const clearFilters =
        document.getElementById("clearFilters");

    const resetNoResults =
        document.getElementById("resetNoResults");

    const productCount =
        document.getElementById("productCount");

    const noProductsMessage =
        document.getElementById("noProductsMessage");

function applyFilters() {

    const cards = Array.from(
        container.querySelectorAll(".product-card")
    );

    const search = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    const selectedCategory = categoryFilter
        ? normalizeCategory(categoryFilter.value)
        : "all";

    const selectedPrice = priceFilter
        ? priceFilter.value
        : "all";

    const selectedPurity = purityFilter
        ? normalizePurity(purityFilter.value)
        : "all";

    const sortValue = sortFilter
        ? sortFilter.value
        : "default";

    const visible = [];

    cards.forEach(function(card) {

        const name = String(
            card.dataset.name || ""
        ).toLowerCase();

        const category = normalizeCategory(
            card.dataset.category || ""
        );

        const purity = normalizePurity(
            card.dataset.purity || ""
        );

        const price = Number(
            card.dataset.price || 0
        );


        // ================= SEARCH =================

        const searchMatch =
            search === "" ||
            name.includes(search) ||
            category.includes(search);


        // ================= CATEGORY =================

        const categoryMatch =
            selectedCategory === "all" ||
            selectedCategory === "" ||
            category === selectedCategory;


        // ================= PRICE =================

        let priceMatch = true;

        if (
            selectedPrice &&
            selectedPrice !== "all"
        ) {

            if (selectedPrice === "0-25000") {

                priceMatch =
                    price < 25000;

            } else if (selectedPrice === "25000-50000") {

                priceMatch =
                    price >= 25000 &&
                    price <= 50000;

            } else if (selectedPrice === "50000-100000") {

                priceMatch =
                    price > 50000 &&
                    price <= 100000;

            } else if (selectedPrice === "100000+") {

                priceMatch =
                    price > 100000;
            }
        }


        // ================= PURITY =================

        const purityMatch =
            selectedPurity === "all" ||
            selectedPurity === "" ||
            purity === selectedPurity ||
            purity.includes(selectedPurity);


        // ================= FINAL =================

        const matched =
            searchMatch &&
            categoryMatch &&
            priceMatch &&
            purityMatch;


        if (matched) {

            card.style.display = "";

            visible.push(card);

        } else {

            card.style.display = "none";

        }

    });


    // ================= SORT =================

    if (sortValue === "price-low") {

        visible.sort(function(a, b) {

            return (
                Number(a.dataset.price || 0) -
                Number(b.dataset.price || 0)
            );

        });

    }

    else if (sortValue === "price-high") {

        visible.sort(function(a, b) {

            return (
                Number(b.dataset.price || 0) -
                Number(a.dataset.price || 0)
            );

        });

    }

    else if (sortValue === "name-az") {

        visible.sort(function(a, b) {

            return String(
                a.dataset.name || ""
            ).localeCompare(
                String(b.dataset.name || "")
            );

        });

    }


    // ================= REORDER =================

    visible.forEach(function(card) {

        container.appendChild(card);

    });


    // ================= COUNT =================

    if (productCount) {

        productCount.textContent =
            "Showing " +
            visible.length +
            " of " +
            cards.length +
            " products";

    }


    // ================= NO PRODUCTS =================

    if (noProductsMessage) {

        noProductsMessage.hidden =
            visible.length !== 0;

    }

}


// IMPORTANT
window.applyJewelleryFilters = applyFilters;

    // ================= EVENTS =================

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            applyFilters
        );

    }


    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            applyFilters
        );

    }


    if (priceFilter) {

        priceFilter.addEventListener(
            "change",
            applyFilters
        );

    }


    if (purityFilter) {

        purityFilter.addEventListener(
            "change",
            applyFilters
        );

    }


    if (sortFilter) {

        sortFilter.addEventListener(
            "change",
            applyFilters
        );

    }


    // ================= CLEAR SEARCH =================

    if (clearSearch) {

        clearSearch.addEventListener(
            "click",
            function () {

                if (searchInput) {
                    searchInput.value = "";
                }

                applyFilters();

            }
        );

    }


    // ================= CLEAR ALL =================

    function resetFilters() {

        if (searchInput) {
            searchInput.value = "";
        }

        if (categoryFilter) {
            categoryFilter.value = "all";
        }

        if (priceFilter) {
            priceFilter.value = "all";
        }

        if (purityFilter) {
            purityFilter.value = "all";
        }

        if (sortFilter) {
            sortFilter.value = "featured";
        }

        applyFilters();

    }


    if (clearFilters) {

        clearFilters.addEventListener(
            "click",
            resetFilters
        );

    }


    if (resetNoResults) {

        resetNoResults.addEventListener(
            "click",
            resetFilters
        );

    }

});


// =====================================================
// LOAD ALL REAL JEWELLERY IMAGES
// =====================================================

document.addEventListener("DOMContentLoaded", async function () {

    try {

        const response = await fetch(
            "https://pushapa-jewellers.onrender.com/api/jewellery-images"
        );

        const products = await response.json();

        console.log("REAL PRODUCTS:", products.length);

        if (products.length > 0) {
            window.allJewelleryProducts = products;
            displayProducts(products);
        }

    } catch (error) {

        console.error("PRODUCT IMAGE ERROR:", error);

    }

});
// =====================================================
// PUSHAPA JEWELLERS - PREMIUM ALERT SYSTEM
// =====================================================

function showPremiumAlert(message, type = "success") {

    let alertBox = document.getElementById("premiumAlert");

    if (!alertBox) {

        alertBox = document.createElement("div");

        alertBox.id = "premiumAlert";

        alertBox.innerHTML = `
            <div class="premium-alert-icon">
                <i class="fa-solid fa-check"></i>
            </div>

            <div class="premium-alert-content">
                <h3 id="premiumAlertTitle">Success</h3>
                <p id="premiumAlertMessage"></p>
            </div>

            <button onclick="closePremiumAlert()">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;

        document.body.appendChild(alertBox);
    }

    const icon = alertBox.querySelector(".premium-alert-icon i");
    const title = alertBox.querySelector("#premiumAlertTitle");
    const msg = alertBox.querySelector("#premiumAlertMessage");

    msg.textContent = message;

    if (type === "error") {
        title.textContent = "Oops!";
        icon.className = "fa-solid fa-xmark";
    }
    else if (type === "wishlist") {
        title.textContent = "Wishlist";
        icon.className = "fa-solid fa-heart";
    }
    else if (type === "cart") {
        title.textContent = "Added to Cart";
        icon.className = "fa-solid fa-cart-shopping";
    }
    else if (type === "order") {
        title.textContent = "Order Successful";
        icon.className = "fa-solid fa-check";
    }
    else {
        title.textContent = "Success";
        icon.className = "fa-solid fa-check";
    }

    alertBox.classList.add("show");

    clearTimeout(window.premiumAlertTimer);

    window.premiumAlertTimer = setTimeout(() => {
        closePremiumAlert();
    }, 3000);
}


function closePremiumAlert() {

    const alertBox = document.getElementById("premiumAlert");

    if (alertBox) {
        alertBox.classList.remove("show");
    }
}