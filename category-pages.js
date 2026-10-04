// =====================================================
// PUSHAPA JEWELLERS
// CATEGORY PAGES - PRODUCT CARDS + WISHLIST
// =====================================================


// =====================================================
// WISHLIST BUTTON DESIGN
// =====================================================

const wishlistStyle = document.createElement("style");

wishlistStyle.textContent = `

/* NORMAL WISHLIST */

.category-product-container .product-wishlist-btn {

    width: 86px !important;
    height: 36px !important;

    border-radius: 30px !important;

    background: #050505 !important;
    border: 1px solid #d4af37 !important;

    color: #d4af37 !important;

    display: flex !important;
    align-items: center !important;
    justify-content: center !important;

    cursor: pointer !important;

    transition:
        background 0.3s ease,
        color 0.3s ease,
        transform 0.2s ease !important;

}


/* NORMAL HEART */

.category-product-container
.product-wishlist-btn i {

    color: #d4af37 !important;

    font-size: 17px !important;

    transition: color 0.3s ease !important;

}


/* ==========================================
   ACTIVE / CLICKED WISHLIST
========================================== */

.category-product-container
.product-wishlist-btn.active {

    background: #d4af37 !important;

    border-color: #d4af37 !important;

}


/* BLACK FILLED HEART */

.category-product-container
.product-wishlist-btn.active i {

    color: #000000 !important;

}


/* HOVER */

.category-product-container
.product-wishlist-btn:hover {

    transform: scale(1.05);

}

`;

document.head.appendChild(wishlistStyle);


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    const container =
        document.querySelector(".category-product-container");

    if (!container) return;

    const selectedCategory =
        (container.dataset.category || "")
            .toLowerCase()
            .trim();

    loadCategoryProducts(
        selectedCategory,
        container
    );

});


// =====================================================
// LOAD CATEGORY PRODUCTS
// =====================================================

async function loadCategoryProducts(category, container) {

    try {

        const response = await fetch(
            "http://localhost:5000/api/jewellery-images"
        );

        if (!response.ok) {

            throw new Error(
                "Failed to load products"
            );

        }

        const products =
            await response.json();


        const categoryProducts =
            products.filter(product => {

                const productCategory =
                    String(
                        product.category ||
                        product.type ||
                        ""
                    )
                    .toLowerCase()
                    .trim();


                return (
                    normalizeCategoryValue(
                        productCategory
                    ) ===
                    normalizeCategoryValue(
                        category
                    )
                );

            });


        container.innerHTML = "";


        if (categoryProducts.length === 0) {

            container.innerHTML = `

                <p style="
                    color:#d4af37;
                    text-align:center;
                    grid-column:1/-1;
                    font-size:18px;
                ">

                    No products found.

                </p>

            `;

            return;

        }


        categoryProducts.forEach(product => {

            createCategoryCard(
                product,
                container
            );

        });

    }

    catch (error) {

        console.error(
            "Category products error:",
            error
        );


        container.innerHTML = `

            <p style="
                color:#d4af37;
                text-align:center;
                grid-column:1/-1;
                font-size:18px;
            ">

                Unable to load products.

            </p>

        `;

    }

}


// =====================================================
// CATEGORY NORMALIZATION
// =====================================================

function normalizeCategoryValue(value) {

    value = String(value)
        .toLowerCase()
        .trim();


    const map = {

        ring: "rings",
        rings: "rings",

        necklace: "necklaces",
        necklaces: "necklaces",

        earring: "earrings",
        earrings: "earrings",

        bangle: "bangles",
        bangles: "bangles",

        bracelet: "bracelets",
        bracelets: "bracelets",

        chain: "chains",
        chains: "chains",

        pendant: "pendants",
        pendants: "pendants",

        mangalsutra: "mangalsutra",
        mangalsutras: "mangalsutra"

    };


    return map[value] || value;

}


// =====================================================
// CLEAN PRODUCT NAME
// =====================================================

function cleanCategoryProductName(name) {

    if (!name) {

        return "JEWELLERY";

    }


    return String(name)

        .replace(/\s*\d+\s*$/, "")

        .trim()

        .toUpperCase();

}


// =====================================================
// GET WISHLIST
// =====================================================

function getCategoryWishlist() {

    try {

        return JSON.parse(
            localStorage.getItem("wishlist")
        ) || [];

    }

    catch (error) {

        console.error(
            "Wishlist read error:",
            error
        );

        return [];

    }

}


// =====================================================
// SAVE WISHLIST
// =====================================================

function saveCategoryWishlist(wishlist) {

    localStorage.setItem(
        "wishlist",
        JSON.stringify(wishlist)
    );

}


// =====================================================
// CREATE PRODUCT CARD
// =====================================================

function createCategoryCard(
    product,
    container
) {

    const card =
        document.createElement("div");


    card.className =
        "product-card";


    // =================================================
    // PRODUCT NAME
    // =================================================

    const originalName =

        product.name ||

        product.title ||

        "Jewellery";


    const displayName =

        cleanCategoryProductName(
            originalName
        );


    // =================================================
    // CATEGORY
    // =================================================

    const category =

        String(

            product.category ||

            product.type ||

            "Jewellery"

        ).toUpperCase();


    // =================================================
    // PRICE
    // =================================================

    const price =

        Number(

            product.price ||

            product.amount ||

            0

        );


    // =================================================
    // IMAGE
    // =================================================

    let image =

        product.image ||

        product.imageUrl ||

        product.url ||

        "";


    if (

        image &&

        !image.startsWith("http") &&

        !image.startsWith("images/")

    ) {

        image =

            "http://localhost:5000/" +

            image.replace(/^\/+/, "");

    }


    // =================================================
    // CARD DATA
    // =================================================

    card.dataset.name =
        displayName;

    card.dataset.category =
        category.toLowerCase();

    card.dataset.price =
        price;


    // =================================================
    // CARD HTML
    // =================================================

    card.innerHTML = `

        <div class="product-image-wrap">

            <img
                src="${image}"
                alt="${displayName}"
                loading="lazy"
            >


            <button
                class="product-wishlist-btn"
                type="button"
                title="Add to Wishlist"
            >

                <i class="fa-regular fa-heart"></i>

            </button>

        </div>


        <div class="product-card-content">


            <div class="product-category">

                ${category}

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


            <p class="price">

                ₹${price.toLocaleString("en-IN")}

            </p>


            <div class="product-buttons">


                <button
                    class="view-btn"
                    type="button"
                >

                    VIEW DETAILS

                </button>


                <button
                    class="cart-btn"
                    type="button"
                    data-name="${originalName}"
                    data-price="${price}"
                    data-image="${image}"
                >

                    ADD TO CART

                </button>


            </div>

        </div>

    `;


    // =================================================
    // VIEW DETAILS
    // =================================================

    const viewButton =
        card.querySelector(".view-btn");


    viewButton.addEventListener(
        "click",
        function () {

            localStorage.setItem(
                "selectedProduct",
                JSON.stringify({

                    ...product,

                    name: originalName,

                    price: price,

                    image: image

                })
            );


            window.location.href =
                "view-details.html";

        }
    );


    // =================================================
    // WISHLIST BUTTON
    // =================================================

    const wishlistButton =
        card.querySelector(
            ".product-wishlist-btn"
        );


    const wishlistIcon =
        wishlistButton.querySelector("i");


    // =================================================
    // CHECK EXISTING WISHLIST
    // =================================================

    const wishlist =
        getCategoryWishlist();


    const alreadyInWishlist =
        wishlist.some(item =>

            item.name === originalName

        );


    if (alreadyInWishlist) {

    wishlistButton.classList.add("active");

    wishlistButton.style.setProperty(
        "background",
        "#d4af37",
        "important"
    );

    wishlistButton.style.setProperty(
        "border-color",
        "#d4af37",
        "important"
    );

    wishlistIcon.classList.remove(
        "fa-regular"
    );

    wishlistIcon.classList.add(
        "fa-solid"
    );

    wishlistIcon.style.setProperty(
        "color",
        "#000000",
        "important"
    );

}

// =====================================================
// WISHLIST CLICK - DIRECT COLOR CHANGE
// =====================================================

wishlistButton.addEventListener(
    "click",
    function (event) {

        event.preventDefault();
        event.stopPropagation();

        let currentWishlist =
            getCategoryWishlist();

        const existingIndex =
            currentWishlist.findIndex(
                item => item.name === originalName
            );


        // =============================================
        // REMOVE FROM WISHLIST
        // =============================================

        if (existingIndex !== -1) {

            currentWishlist.splice(
                existingIndex,
                1
            );

            // BLACK BUTTON
            wishlistButton.style.setProperty(
                "background",
                "#050505",
                "important"
            );

            wishlistButton.style.setProperty(
                "border-color",
                "#d4af37",
                "important"
            );

            // GOLD HEART
            wishlistIcon.classList.remove(
                "fa-solid"
            );

            wishlistIcon.classList.add(
                "fa-regular"
            );

            wishlistIcon.style.setProperty(
                "color",
                "#d4af37",
                "important"
            );

            wishlistButton.classList.remove(
                "active"
            );

        }


        // =============================================
        // ADD TO WISHLIST
        // =============================================

        else {

            currentWishlist.push({

                name: originalName,

                image: image,

                price: Number(price)

            });


            // GOLD BUTTON
            wishlistButton.style.setProperty(
                "background",
                "#d4af37",
                "important"
            );

            wishlistButton.style.setProperty(
                "border-color",
                "#d4af37",
                "important"
            );


            // BLACK FILLED HEART
            wishlistIcon.classList.remove(
                "fa-regular"
            );

            wishlistIcon.classList.add(
                "fa-solid"
            );

            wishlistIcon.style.setProperty(
                "color",
                "#000000",
                "important"
            );


            wishlistButton.classList.add(
                "active"
            );

        }


        // SAVE WISHLIST

        saveCategoryWishlist(
            currentWishlist
        );

    }
);
    // =================================================
    // ADD CARD
    // =================================================

    container.appendChild(card);

}