require("dotenv").config();
console.log("EMAIL USER:", process.env.EMAIL_USER);
console.log("EMAIL PASS:", process.env.EMAIL_PASS ? "LOADED" : "MISSING");
const fs = require("fs");
const path = require("path");
const Product = require("./models/product");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/user.js");
console.log("USER MODEL FILE:", require.resolve("./models/user.js"));
console.log(
    "OTP FIELD CHECK:",
    User.schema.path("resetPasswordToken") ? "FOUND" : "MISSING"
);

console.log(
    "EXPIRY FIELD CHECK:",
    User.schema.path("resetPasswordExpires") ? "FOUND" : "MISSING"
);
const Cart = require("./models/Cart");
const Order = require("./models/Order");
const ContactMessage = require("./models/ContactMessage");
const CustomDesign = require("./models/CustomDesign");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const app = express();
app.get("/version", (req, res) => {
    res.json({
        version: "PRICE-FIX-2026-10-07",
        message: "NEW SERVER CODE IS RUNNING"
    });
});
// =====================================================
// CLOUDINARY PRODUCT IMAGE UPLOAD
// =====================================================

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,

    params: {
        folder: "pushapa-jewellers/products",
        allowed_formats: ["jpg", "jpeg", "png", "webp"]
    }
});

const upload = multer({
    storage: storage,

    limits: {
        fileSize: 5 * 1024 * 1024
    }
});
app.use(cors());
app.use(express.json());
app.use(
    "/images",
    express.static(path.join(__dirname, "..", "images"))
);

mongoose.connect("mongodb+srv://namratajagdale56_db_user:Namratajagdale2005@pushapacluster.l0tmkad.mongodb.net/Pushapa?retryWrites=true&w=majority")
.then(()=>{
    console.log("MongoDB Connected");
})
.catch((err)=>{
    console.log("MongoDB Error:", err.message);
});
mongoose.connection.on("connected", ()=>{
    console.log("Database name:", mongoose.connection.name);
});
// REGISTER API
app.post("/register", async (req, res) => {

    try {

        const { name, email, password } = req.body;

        console.log("REGISTER DATA:", req.body);

        const user = new User({
            name: name,
            email: email,
            password: password
        });

        await user.save();

        console.log("USER SAVED:", user);

        res.status(200).json({
            message: "User Registered Successfully"
        });

    } catch (error) {

        console.log("REGISTER ERROR:", error);

        res.status(500).json({
            message: error.message
        });

    }

});
// ================= LOGIN API =================

app.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        console.log("LOGIN DATA:", req.body);

        // ADMIN LOGIN
        if (email === "admin@gmail.com" && password === "admin123") {

            return res.json({
                message: "Admin Login Successful",
                role: "admin"
            });

        }
       

        // NORMAL USER LOGIN
        const user = await User.findOne({ email: email });

        if (!user) {

            return res.status(400).json({
                message: "User not found"
            });

        }
        

        if (user.password !== password) {

            return res.status(400).json({
                message: "Incorrect Password"
            });

        }

        res.json({
            message: "Login Successful",
            userId: user._id,
            role: "user"
        });

    }
    catch (error) {

        console.log("LOGIN ERROR:", error);

        res.status(500).json({
            message: error.message
        });

    }

});
// =====================================================
// ADD PRODUCT WITH IMAGE UPLOAD
// =====================================================

app.post("/add-product", upload.single("image"), async (req, res) => {

    try {

        const {
            name,
            price,
            category,
            purity,
            weight
        } = req.body;

        if (!name || !price || !category) {

            return res.status(400).json({
                success: false,
                message: "Name, price and category are required."
            });

        }
let imagePath = "";

if (req.file) {
    imagePath = req.file.path;
}
        const product = new Product({

            name: name,
            price: Number(price),
            category: category,
            purity: purity || "22K",
            weight: weight || "",
            image: imagePath

        });

        await product.save();

        res.status(201).json({

            success: true,
            message: "Product Added Successfully",
            product: product

        });

    } catch (error) {

        console.error("ADD PRODUCT ERROR:", error);

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

});
app.get("/test-db", async(req,res)=>{
    try{

        const data = await mongoose.connection.db.listCollections().toArray();

        res.json(data);

    }catch(error){

        res.json({
            error:error.message
        });

    }
});
// CHECK ALL COLLECTIONS
app.get("/check-products", async (req, res) => {
    try {
        const collections = await mongoose.connection.db
            .listCollections()
            .toArray();

        const result = {};

        for (const collection of collections) {
            result[collection.name] = await mongoose.connection.db
                .collection(collection.name)
                .countDocuments();
        }

        res.json(result);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
);

// GOOGLE LOGIN API
app.post("/api/auth/google", async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({
                status: "error",
                message: "Google credential is missing"
            });
        }

        // Verify Google credential
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        if (!payload || !payload.email || !payload.email_verified) {
            return res.status(401).json({
                status: "error",
                message: "Google email is not verified"
            });
        }

        const { sub, name, email } = payload;

        // Find existing user
        let user = await User.findOne({
            email: email.toLowerCase()
        });

        // Create new Google user if not found
        if (!user) {
            user = new User({
                name: name || "Google User",
                email: email.toLowerCase(),
                googleId: sub,
                password: null
            });

            await user.save();
        } else if (!user.googleId) {
            user.googleId = sub;
            await user.save();
        }

        return res.status(200).json({
            status: "success",
            message: "Google Login Successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("GOOGLE LOGIN ERROR:", error.message);

        return res.status(401).json({
            status: "error",
            message: "Google authentication failed"
        });
    }
});
// GET ALL PRODUCTS API

app.get("/products", async(req,res)=>{

    try{

        console.log("Database:", mongoose.connection.name);

        const products = await Product.find({}).setOptions({
    strictQuery: false
});

        console.log("Products count:", products.length);

        res.json(products);

    }
    catch(error){

        console.log("PRODUCT ERROR:", error);

        res.status(500).json({
            message:error.message
        });

    }

});
// DELETE PRODUCT API

app.delete("/products/:id", async(req,res)=>{

    try{

        const deletedProduct = await Product.findByIdAndDelete(req.params.id);

        if(!deletedProduct){
            return res.status(404).json({
                message:"Product not found"
            });
        }

        res.json({
            message:"Product Deleted Successfully"
        });

    }
    catch(error){

        res.status(500).json({
            message:error.message
        });

    }

});
// =====================================================
// UPDATE PRODUCT WITH IMAGE UPLOAD
// =====================================================

app.put("/products/:id", upload.single("image"), async (req, res) => {

    try {

        const {
            name,
            price,
            category,
            purity,
            weight
        } = req.body;

        const product = await Product.findById(req.params.id);

        if (!product) {

            return res.status(404).json({
                success: false,
                message: "Product not found"
            });

        }

        // Update normal product details
        product.name = name;
        product.price = Number(price);
        product.category = category;
        product.purity = purity || "22K";
        product.weight = weight || "";

        // If new image selected
        if (req.file) {

    product.image =
        req.protocol +
        "://" +
        req.get("host") +
        "/uploads/" +
        req.file.filename;

}

        await product.save();

        res.json({

            success: true,
            message: "Product Updated Successfully",
            product: product

        });

    } catch (error) {

        console.error("UPDATE PRODUCT ERROR:", error);

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

});
app.get("/api/jewellery-images", async (req, res) => {

    try {

        const priceMap = {

            rings: {
                ring1: 4999,
                ring2: 5999,
                ring3: 6999,
                ring4: 7999,
                ring5: 8999,
                ring6: 9999,
                ring7: 10999,
                ring8: 11999,
                ring9: 12999,
                ring10: 13999,
                ring11: 14999,
                ring12: 15999,
                ring13: 16999,
                ring14: 17999,
                ring15: 18999,
                ring16: 19999,
                ring17: 21999,
                ring18: 23999,
                ring19: 25999,
                ring20: 27999,
                ring21: 29999,
                ring22: 32999,
                ring23: 35999,
                ring24: 39999,
                ring25: 44999
            },

            necklace: {
                necklace1: 4999,
                necklace2: 6999,
                necklace3: 8499,
                necklace4: 12999,
                necklace5: 15999,
                necklace6: 18999,
                necklace7: 21999,
                necklace8: 24999,
                necklace9: 28999,
                necklace10: 32999,
                necklace11: 35999,
                necklace12: 39999,
                necklace13: 42999,
                necklace14: 45999,
                necklace15: 49999,
                necklace16: 54999,
                necklace17: 59999,
                necklace18: 64999,
                necklace19: 72999,
                necklace20: 89999
            },

            earrings: {
                earring1: 7999,
                earring2: 9999,
                earring3: 11999,
                earring4: 13999,
                earring5: 15999,
                earring6: 17999,
                earring7: 19999,
                earring8: 22999,
                earring9: 25999,
                earring10: 28999
            },

            bracelets: {
                bracelet1: 7999,
                bracelet2: 9999,
                bracelet3: 11999,
                bracelet4: 13999,
                bracelet5: 15999,
                bracelet6: 17999,
                bracelet7: 19999,
                bracelet8: 22999,
                bracelet9: 25999,
                bracelet10: 28999
            },

            bangles: {
                bangle1: 8999,
                bangle2: 10999,
                bangle3: 12999,
                bangle4: 14999,
                bangle5: 16999,
                bangle6: 18999,
                bangle7: 20999,
                bangle8: 22999,
                bangle9: 25999,
                bangle10: 28999,
                bangle11: 31999,
                bangle12: 34999
            },

            chains: {
                chain1: 8999,
                chain2: 10999,
                chain3: 12999,
                chain4: 14999,
                chain5: 16999,
                chain6: 18999,
                chain7: 20999,
                chain8: 22999,
                chain9: 25999,
                chain10: 28999,
                chain11: 31999,
                chain12: 34999
            },

            pendants: {
                pendant1: 8999,
                pendant2: 10999,
                pendant3: 12999,
                pendant4: 14999,
                pendant5: 16999,
                pendant6: 18999,
                pendant7: 20999,
                pendant8: 22999,
                pendant9: 25999,
                pendant10: 28999,
                pendant11: 32999,
                pendant12: 35999
            },

            mangalsutra: {
                mangalsutra1: 12999,
                mangalsutra2: 14999,
                mangalsutra3: 16999,
                mangalsutra4: 18999,
                mangalsutra5: 20999,
                mangalsutra6: 22999,
                mangalsutra7: 25999,
                mangalsutra8: 28999,
                mangalsutra9: 31999,
                mangalsutra10: 34999
            }
        };


        const imageFolders = [
            "rings",
            "necklace",
            "earrings",
            "bracelets",
            "bangles",
            "chains",
            "pendants",
            "mangalsutra"
        ];


        const products = [];


        for (const category of imageFolders) {

            const folderPath = path.join(
                __dirname,
                "..",
                "images",
                category
            );


            if (!fs.existsSync(folderPath)) {
                console.log("Folder not found:", folderPath);
                continue;
            }


            const files = fs.readdirSync(folderPath);


            for (const file of files) {

                const ext = path.extname(file).toLowerCase();

                if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
                    continue;
                }


                const productName = path
                    .parse(file)
                    .name
                    .toLowerCase()
                    .trim()
                    .replace(/[-_\s]/g, "");


                const categoryPrices = priceMap[category] || {};

                const price = categoryPrices[productName];


                // Hero images skip
                if (productName.includes("hero")) {
                    continue;
                }


                // Unknown product skip
                if (price === undefined) {
                    console.log(
                        "PRICE NOT FOUND:",
                        category,
                        productName
                    );
                    continue;
                }


                console.log(
                    "PRICE:",
                    category,
                    productName,
                    "=>",
                    price
                );


                products.push({
                    name: productName,
                    category: category,
                    price: price,
                    purity: "22K",
                    image: `images/${category}/${file}`
                });

            }
        }


        console.log(
            "TOTAL IMAGE PRODUCTS:",
            products.length
        );


        res.json(products);

    } catch (error) {

        console.error(
            "Jewellery image API error:",
            error
        );

        res.status(500).json({
            message: "Failed to load jewellery images"
        });

    }

});
// ================= HOME TEST =================

app.get("/", (req,res)=>{
    res.send("Pushapa Jewellers Backend Running");
});

// =====================================================
// ORDERS APIs
// =====================================================

// CREATE ORDER
app.post("/orders", async (req, res) => {

    try {

        console.log("NEW ORDER DATA:", req.body);

        const order = new Order({
            orderId: req.body.orderId,
            customerName: req.body.customerName,
            mobile: req.body.mobile,
            email: req.body.email,
            address: req.body.address,
            city: req.body.city,
            pincode: req.body.pincode,
            productName: req.body.productName,
            productPrice: req.body.productPrice,
            paymentMethod: req.body.paymentMethod || "cod",
            status: "Placed"
        });

        await order.save();

        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order: order
        });

    } catch (error) {

        console.error("CREATE ORDER ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

});


// GET ALL ORDERS
app.get("/orders", async (req, res) => {

    try {

        const orders = await Order.find({})
            .sort({ createdAt: -1 });

        res.json(orders);

    } catch (error) {

        console.error("GET ORDERS ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

});


// UPDATE ORDER STATUS
app.put("/orders/:id", async (req, res) => {

    try {

        const { status } = req.body;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status: status },
            { new: true }
        );

        if (!order) {

            return res.status(404).json({
                success: false,
                message: "Order not found"
            });

        }

        res.json({
            success: true,
            message: "Order status updated",
            order: order
        });

    } catch (error) {

        console.error("UPDATE ORDER ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

});


// DELETE ORDER
app.delete("/orders/:id", async (req, res) => {

    try {

        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) {

            return res.status(404).json({
                success: false,
                message: "Order not found"
            });

        }

        res.json({
            success: true,
            message: "Order deleted successfully"
        });

    } catch (error) {

        console.error("DELETE ORDER ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

});
// =====================================================
// GET ALL CUSTOMER USERS
// =====================================================

app.get("/users", async (req, res) => {

    try {

        const users = await User.find({})
            .select("-password")
            .sort({ _id: -1 });

        res.json(users);

    } catch (error) {

        console.error("GET USERS ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

});
// =====================================================
// GOLD & SILVER RATE APIs
// =====================================================

// GET CURRENT GOLD & SILVER RATES
app.get("/gold-rates", async (req, res) => {

    try {

        const rates = await mongoose.connection.db
            .collection("settings")
            .findOne({ type: "metalRates" });

        if (!rates) {

            return res.json({
                gold22k: 0,
                gold24k: 0,
                silver: 0,
                updatedAt: null
            });

        }

        res.json({
            gold22k: rates.gold22k || 0,
            gold24k: rates.gold24k || 0,
            silver: rates.silver || 0,
            updatedAt: rates.updatedAt || null
        });

    } catch (error) {

        console.error("GET RATES ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

});


// UPDATE GOLD & SILVER RATES
app.put("/gold-rates", async (req, res) => {

    try {

        const gold22k = Number(req.body.gold22k);
        const gold24k = Number(req.body.gold24k);
        const silver = Number(req.body.silver);

        if (!gold22k || !gold24k || !silver) {

            return res.status(400).json({
                success: false,
                message: "Please enter all metal rates."
            });

        }

        await mongoose.connection.db
            .collection("settings")
            .updateOne(
                { type: "metalRates" },
                {
                    $set: {
                        type: "metalRates",
                        gold22k: gold22k,
                        gold24k: gold24k,
                        silver: silver,
                        updatedAt: new Date()
                    }
                },
                { upsert: true }
            );

        res.json({
            success: true,
            message: "Rates updated successfully"
        });

    } catch (error) {

        console.error("UPDATE RATES ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

});
// =====================================================
// CONTACT MESSAGES
// =====================================================

app.post("/contact-messages", async (req, res) => {
    try {

        const {
            name,
            email,
            phone,
            subject,
            message
        } = req.body;

        if (!name || !email || !phone || !message) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields."
            });
        }

        const contact = new ContactMessage({
            name,
            email,
            phone,
            subject: subject || "",
            message,
            status: "New"
        });

        await contact.save();

        res.status(201).json({
            success: true,
            message: "Message sent successfully",
            contact
        });

    } catch (error) {

        console.error(
            "CONTACT MESSAGE ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// GET ALL CONTACT MESSAGES

app.get("/contact-messages", async (req, res) => {
    try {

        const messages = await ContactMessage
            .find({})
            .sort({ createdAt: -1 });

        res.json(messages);

    } catch (error) {

        console.error(
            "GET CONTACT MESSAGES ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// UPDATE MESSAGE STATUS

app.put("/contact-messages/:id", async (req, res) => {
    try {

        const { status } = req.body;

        const message =
            await ContactMessage.findByIdAndUpdate(
                req.params.id,
                { status },
                { new: true }
            );

        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found"
            });
        }

        res.json({
            success: true,
            message: "Message status updated",
            contact: message
        });

    } catch (error) {

        console.error(
            "UPDATE CONTACT MESSAGE ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// DELETE MESSAGE

app.delete("/contact-messages/:id", async (req, res) => {
    try {

        const message =
            await ContactMessage.findByIdAndDelete(
                req.params.id
            );

        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found"
            });
        }

        res.json({
            success: true,
            message: "Message deleted successfully"
        });

    } catch (error) {

        console.error(
            "DELETE CONTACT MESSAGE ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});
/* =====================================================
   CUSTOM JEWELLERY DESIGN
===================================================== */

app.post(
    "/custom-designs",
    upload.single("image"),
    async (req, res) => {

        try {

            const {
                name,
                phone,
                email,
                jewelleryType,
                purity,
                weight,
                notes
            } = req.body;


            if (
                !name ||
                !phone ||
                !email ||
                !jewelleryType ||
                !purity ||
                !weight
            ) {

                return res.status(400).json({
                    success: false,
                    message: "Please fill all required fields."
                });

            }


            if (!req.file) {

                return res.status(400).json({
                    success: false,
                    message: "Please upload a jewellery design."
                });

            }


            const customDesign =
                new CustomDesign({

                    name: name,

                    phone: phone,

                    email: email,

                    jewelleryType:
                        jewelleryType,

                    purity: purity,

                    weight:
                        Number(weight),

                    notes:
                        notes || "",

                    image:
                        "uploads/" +
                        req.file.filename,

                    status: "New"

                });


            await customDesign.save();


            res.status(201).json({

                success: true,

                message:
                    "Custom design request sent successfully!",

                customDesign:
                    customDesign

            });


        } catch (error) {

            console.error(
                "CUSTOM DESIGN ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    error.message

            });

        }

    }
);



/* =====================================================
   GET CUSTOM DESIGN REQUESTS
===================================================== */

app.get(
    "/custom-designs",
    async (req, res) => {

        try {

            const designs =
                await CustomDesign
                    .find({})
                    .sort({
                        createdAt: -1
                    });


            res.json(designs);


        } catch (error) {

            console.error(
                "GET CUSTOM DESIGNS ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    error.message

            });

        }

    }
);



/* =====================================================
   UPDATE CUSTOM DESIGN STATUS
===================================================== */

app.put(
    "/custom-designs/:id",
    async (req, res) => {

        try {

            const {
                status
            } = req.body;


            const design =
                await CustomDesign
                    .findByIdAndUpdate(
                        req.params.id,
                        {
                            status:
                                status
                        },
                        {
                            new: true
                        }
                    );


            if (!design) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Custom design request not found."

                });

            }


            res.json({

                success: true,

                message:
                    "Status updated successfully.",

                design:
                    design

            });


        } catch (error) {

            console.error(
                "CUSTOM DESIGN STATUS ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    error.message

            });

        }

    }
);



/* =====================================================
   DELETE CUSTOM DESIGN
===================================================== */

app.delete(
    "/custom-designs/:id",
    async (req, res) => {

        try {

            const design =
                await CustomDesign
                    .findByIdAndDelete(
                        req.params.id
                    );


            if (!design) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Custom design request not found."

                });

            }


            res.json({

                success: true,

                message:
                    "Custom design deleted successfully."

            });


        } catch (error) {

            console.error(
                "DELETE CUSTOM DESIGN ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    error.message

            });

        }

    }
);
// =====================================================
// FORGOT PASSWORD - OTP
// =====================================================

app.post("/api/auth/forgot-password", async (req, res) => {

    try {

        const email = String(req.body.email || "")
            .trim()
            .toLowerCase();

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const user = await User.findOne({
            email: email
        });

        if (!user) {
            return res.status(404).json({
                message: "No account found with this email"
            });
        }

        // Generate OTP
        const otp = String(
            Math.floor(100000 + Math.random() * 900000)
        );

        const expiry = new Date(
            Date.now() + 10 * 60 * 1000
        );

        console.log("GENERATED OTP:", otp);

        // DIRECTLY SAVE OTP TO MONGODB
        const updateResult = await User.updateOne(
            { _id: user._id },
            {
                $set: {
                    resetPasswordToken: otp,
                    resetPasswordExpires: expiry
                }
            }
        );

        console.log("OTP UPDATE RESULT:", updateResult);

        // VERIFY FROM DATABASE
        const savedUser = await User.findById(user._id);

        console.log(
            "DATABASE OTP:",
            savedUser.resetPasswordToken
        );

        console.log(
            "DATABASE OTP EXPIRY:",
            savedUser.resetPasswordExpires
        );

        // Gmail transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",

            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Send OTP email
        await transporter.sendMail({

            from: process.env.EMAIL_USER,

            to: user.email,

            subject: "Pushapa Jewellers - Password Reset OTP",

            html: `
                <div style="
                    font-family: Arial;
                    background:#111;
                    padding:35px;
                    color:white;
                    text-align:center;
                ">

                    <h1 style="color:#FFD700;">
                        Pushapa Jewellers
                    </h1>

                    <h2>Password Reset</h2>

                    <p>
                        Your password reset OTP is:
                    </p>

                    <div style="
                        display:inline-block;
                        padding:15px 30px;
                        background:#FFD700;
                        color:#000;
                        font-size:30px;
                        font-weight:bold;
                        letter-spacing:8px;
                        border-radius:8px;
                        margin:15px 0;
                    ">
                        ${otp}
                    </div>

                    <p style="color:#aaa;">
                        This OTP will expire in 10 minutes.
                    </p>

                    <p style="color:#aaa;">
                        If you did not request a password reset,
                        please ignore this email.
                    </p>

                </div>
            `
        });

        res.json({
            message: "OTP has been sent to your email."
        });

    } catch (error) {

        console.log("FORGOT PASSWORD ERROR:", error);

        res.status(500).json({
            message: "Unable to send OTP"
        });

    }

});
// =====================================================
// RESET PASSWORD - OTP
// =====================================================

app.post("/api/auth/reset-password", async (req, res) => {

    try {

        let { email, otp, newPassword } = req.body;

        email = String(email || "").trim().toLowerCase();
        otp = String(otp || "").trim();
        newPassword = String(newPassword || "");

        console.log("RESET EMAIL:", email);
        console.log("ENTERED OTP:", otp);

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                message: "Email, OTP and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        // First find user only by email
        const user = await User.findOne({
            email: email
        });

        console.log("USER FOUND:", user ? "YES" : "NO");

        if (!user) {
            return res.status(400).json({
                message: "No account found with this email"
            });
        }

        console.log("SAVED OTP:", user.resetPasswordToken);
        console.log("OTP EXPIRES:", user.resetPasswordExpires);
        console.log("CURRENT TIME:", new Date());

        // Check OTP
        if (String(user.resetPasswordToken) !== String(otp)) {
            return res.status(400).json({
                message: "Incorrect OTP"
            });
        }

        // Check expiry
        if (
            !user.resetPasswordExpires ||
            new Date(user.resetPasswordExpires) <= new Date()
        ) {
            return res.status(400).json({
                message: "OTP has expired. Please request a new OTP."
            });
        }

        // Reset password
        user.password = newPassword;

        // Clear OTP
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        await user.save();

        console.log("PASSWORD RESET SUCCESS");

        return res.status(200).json({
            message: "Password reset successfully"
        });

    } catch (error) {

        console.log("RESET PASSWORD ERROR:", error);

        return res.status(500).json({
            message: "Unable to reset password"
        });

    }

});
const path = require("path");

app.use(express.static(path.join(__dirname, "..")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "index.html"));
});
// ================= START SERVER =================

app.listen(5000, ()=>{
    console.log("Server started on port 5000");
});
