require("dotenv").config();
console.log("EMAIL USER:", process.env.EMAIL_USER);
console.log("EMAIL PASS:", process.env.EMAIL_PASS ? "LOADED" : "MISSING");
const fs = require("fs");
const path = require("path");
const Product = require("./models/product");
const multer = require("multer");
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
// =====================================================
// PRODUCT IMAGE UPLOAD
// =====================================================

const uploadFolder = path.join(__dirname, "uploads");
console.log("UPLOAD FOLDER:", uploadFolder);

if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
}

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, uploadFolder);
    },

    filename: function (req, file, cb) {

        const uniqueName =
            Date.now() +
            "-" +
            file.originalname.replace(/\s+/g, "-");

        cb(null, uniqueName);
    }

});

const upload = multer({
    storage: storage,

    fileFilter: function (req, file, cb) {

        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only JPG, JPEG, PNG and WEBP images are allowed."));
        }

    },

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
app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
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
    imagePath =
        req.protocol +
        "://" +
        req.get("host") +
        "/uploads/" +
        req.file.filename;
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
// =====================================================
// GET ALL JEWELLERY IMAGES
// =====================================================

app.get("/api/jewellery-images", (req, res) => {

    const imagesPath = path.join(__dirname, "..", "images");

    const categories = [
        "rings",
        "necklace",
        "earrings",
        "bracelets",
        "bangles",
        "chains",
        "pendants",
        "mangalsutra",
        "occasion"
    ];

    const products = [];

    categories.forEach((category) => {

        const categoryPath = path.join(imagesPath, category);

        if (!fs.existsSync(categoryPath)) {
            console.log("Folder not found:", category);
            return;
        }

        const files = fs.readdirSync(categoryPath);

        files.forEach((file) => {

            const extension = path.extname(file).toLowerCase();

            if (
                extension === ".jpg" ||
                extension === ".jpeg" ||
                extension === ".png" ||
                extension === ".webp"
            ) {

                const productName = path
                    .parse(file)
                    .name
                    .replace(/[-_]/g, " ");

                products.push({
                    name: productName,
                    category: category,
                    price: 4999,
                    purity: "22K",
                    image: `images/${category}/${file}`
                });

            }

        });

    });

    console.log("Total image products:", products.length);

    res.json(products);

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
// ================= START SERVER =================

app.listen(5000, ()=>{
    console.log("Server started on port 5000");
});
