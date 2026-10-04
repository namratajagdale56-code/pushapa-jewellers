// ==============================
// IMAGE GALLERY
// ==============================

const mainImage = document.getElementById("productImage");
const thumbnails = document.querySelectorAll(".thumbnail-list img");

thumbnails.forEach((img) => {

    img.addEventListener("click", function () {

        mainImage.src = this.src;

        thumbnails.forEach(item => {
            item.style.border = "1px solid #7a5a15";
        });

        this.style.border = "3px solid gold";

    });

});

// ==============================
// IMAGE ZOOM
// ==============================

mainImage.addEventListener("mousemove", function(e){

    let rect = mainImage.getBoundingClientRect();

    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;

    mainImage.style.transformOrigin = `${x}% ${y}%`;
    mainImage.style.transform = "scale(1.8)";

});

mainImage.addEventListener("mouseleave", function(){

    mainImage.style.transform = "scale(1)";
    mainImage.style.transformOrigin = "center";

});

// ==============================
// PRICE UPDATE
// ==============================

const purity = document.getElementById("purity");
const weight = document.getElementById("weight");

const productPrice = document.getElementById("productPrice");

function updatePrice(){

    let base = 50000;

    let purityValue = purity.value;
    let weightValue = weight.value;

    if(purityValue === "18K Gold"){
        base -= 5000;
    }

    if(purityValue === "24K Gold"){
        base += 8000;
    }

    if(weightValue === "2 Gram"){
        base -= 15000;
    }

    if(weightValue === "10 Gram"){
        base += 25000;
    }

    productPrice.innerHTML = base.toLocaleString();

    document.querySelector(".total span:last-child").innerHTML =
    "₹" + base.toLocaleString();

}

purity.addEventListener("change", updatePrice);
weight.addEventListener("change", updatePrice);

// ==============================
// ADD TO CART
// ==============================

const cartBtn = document.querySelector(".cart-btn");

cartBtn.addEventListener("click", () => {

    let product = {

        name: document.getElementById("productName").innerText,

        price: productPrice.innerText,

        image: mainImage.src,

        purity: purity.value,

        weight: weight.value

    };

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    cart.push(product);

    localStorage.setItem("cart", JSON.stringify(cart));

    alert("Product Added To Cart 🛒");

});

// ==============================
// BUY NOW
// ==============================

const buyBtn = document.querySelector(".buy-btn");

buyBtn.addEventListener("click", () => {

    alert("Proceeding to Checkout...");

    window.location.href = "cart.html";

});

// ==============================
// FADE ANIMATION
// ==============================

window.addEventListener("load", ()=>{

    document.querySelector(".detail-container").style.opacity="0";

    setTimeout(()=>{

        document.querySelector(".detail-container").style.transition=".8s";

        document.querySelector(".detail-container").style.opacity="1";

    },200);

});