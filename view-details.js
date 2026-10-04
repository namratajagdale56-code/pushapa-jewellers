/* =====================================================
   PUSHAPA JEWELLERS
   VIEW DETAILS JAVASCRIPT
===================================================== */

let quantity = 1;


/* =====================================================
   LOAD SELECTED PRODUCT
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const productData = localStorage.getItem("selectedProduct");

    if (!productData) {

        console.log("No product selected.");

        return;
    }


    const product = JSON.parse(productData);


    /* ================= IMAGE ================= */

    const productImage =
        document.getElementById("mainProductImage");

    if (productImage && product.image) {

        productImage.src = product.image;

        productImage.alt = product.name;

    }
    const thumbnailContainer =
    document.getElementById("thumbnailContainer");

if (thumbnailContainer && product.image) {

    const thumbnail = document.createElement("img");

    thumbnail.src = product.image;
    thumbnail.alt = product.name;

    thumbnail.classList.add("thumbnail", "active");

    thumbnail.onclick = function () {
        changeImage(product.image);
    };

    thumbnailContainer.appendChild(thumbnail);
}

    /* ================= PRODUCT NAME ================= */

    const productName =
        document.getElementById("productName");

    if (productName && product.name) {

        productName.innerText = product.name;

    }


    /* ================= PRICE ================= */

    const productPrice =
        document.getElementById("productPrice");

    if (productPrice && product.price) {

        productPrice.innerText =
            "₹ " + Number(product.price).toLocaleString("en-IN");

    }


    /* ================= CATEGORY ================= */

    const productCategory =
        document.getElementById("productCategory");

    if (productCategory && product.category) {

        productCategory.innerText =
            product.category.toUpperCase();

    }


    /* ================= INFORMATION CATEGORY ================= */

    const informationCategory =
        document.getElementById("informationCategory");

    if (informationCategory && product.category) {

        informationCategory.innerText =
            product.category;

    }

});


/* =====================================================
   CHANGE MAIN IMAGE
===================================================== */

function changeImage(imageSrc) {

    const mainImage =
        document.getElementById("mainProductImage");

    if (mainImage) {

        mainImage.src = imageSrc;

    }


    /* Remove active class */

    const thumbnails =
        document.querySelectorAll(".thumbnail");

    thumbnails.forEach(function (thumbnail) {

        thumbnail.classList.remove("active");

    });


    /* Add active class */

    const clickedThumbnail =
        [...thumbnails].find(
            thumbnail => thumbnail.src === imageSrc
        );

    if (clickedThumbnail) {

        clickedThumbnail.classList.add("active");

    }

}


/* =====================================================
   INCREASE QUANTITY
===================================================== */

function increaseQty() {

    quantity++;

    const quantityElement =
        document.getElementById("quantity");

    if (quantityElement) {

        quantityElement.innerText = quantity;

    }

}


/* =====================================================
   DECREASE QUANTITY
===================================================== */

function decreaseQty() {

    if (quantity > 1) {

        quantity--;

    }


    const quantityElement =
        document.getElementById("quantity");

    if (quantityElement) {

        quantityElement.innerText = quantity;

    }

}


/* =====================================================
   ADD TO CART
===================================================== */

function addToCart() {

    const productData =
        localStorage.getItem("selectedProduct");


    if (!productData) {

        alert("Please select a product first.");

        return;

    }


    const product =
        JSON.parse(productData);


    product.quantity = quantity;


    let cart =
        JSON.parse(localStorage.getItem("cart")) || [];


    cart.push(product);


    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );


    alert("Product added to cart successfully!");


}


/* =====================================================
   BUY NOW
===================================================== */

function buyNow() {

    const productData =
        localStorage.getItem("selectedProduct");


    if (!productData) {

        alert("Please select a product first.");

        return;

    }


    const product =
        JSON.parse(productData);


    product.quantity = quantity;


    localStorage.setItem(
        "buyNowProduct",
        JSON.stringify(product)
    );


   window.location.href = "buy-now.html";

}