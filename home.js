// ==========================================
// PUSHPA JEWELLERS - HOME PAGE
// home.js
// ==========================================

// Sticky Header
const header = document.querySelector("header");

window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
        header.style.background = "rgba(0,0,0,0.95)";
        header.style.boxShadow = "0 8px 20px rgba(0,0,0,0.4)";
    } else {
        header.style.background = "rgba(0,0,0,0.85)";
        header.style.boxShadow = "none";
    }
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", function(e) {
        const target = document.querySelector(this.getAttribute("href"));

        if (target) {
            e.preventDefault();

            target.scrollIntoView({
                behavior: "smooth"
            });
        }
    });
});

// Scroll Animation
const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";

        }

    });

}, {
    threshold: 0.2
});

const sections = document.querySelectorAll(
    ".box, .card, .why-card, .latest-card, .testimonial-card"
);

sections.forEach(section => {

    section.style.opacity = "0";
    section.style.transform = "translateY(60px)";
    section.style.transition = "all .8s ease";

    observer.observe(section);

});

// Newsletter Form
const form = document.querySelector(".newsletter form");

if (form) {

    form.addEventListener("submit", function(e) {

        e.preventDefault();

        const email = this.querySelector("input").value.trim();

        if (email === "") {

            alert("Please enter your email.");
            return;

        }

        alert("Thank You! You have successfully subscribed.");

        this.reset();

    });

}

// Active Navigation
const navLinks = document.querySelectorAll("nav a");

navLinks.forEach(link => {

    link.addEventListener("click", function() {

        navLinks.forEach(item => item.classList.remove("active"));

        this.classList.add("active");

    });

});

// Scroll to Top Button (Optional)
const topBtn = document.createElement("button");

topBtn.innerHTML = "↑";
topBtn.className = "top-btn";

document.body.appendChild(topBtn);

topBtn.style.cssText = `
position:fixed;
bottom:25px;
right:25px;
width:50px;
height:50px;
border:none;
border-radius:50%;
background:#d4af37;
color:#111;
font-size:22px;
font-weight:bold;
cursor:pointer;
display:none;
z-index:9999;
transition:.3s;
`;

window.addEventListener("scroll", () => {

    if (window.scrollY > 400) {

        topBtn.style.display = "block";

    } else {

        topBtn.style.display = "none";

    }

});

topBtn.addEventListener("click", () => {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});