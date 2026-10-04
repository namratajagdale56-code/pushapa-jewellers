const Product = require("./models/Product");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/User");
const Cart = require("./models/Cart");
const app = express();

app.use(cors());
app.use(express.json());
app.use('/images', express.static('images'));
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
// Register API

app.post("/register", async (req,res)=>{

    try{

        const {name,email,password} = req.body;

        const user = new User({
            name,
            email,
            password
        });

        await user.save();

        res.json({
            message:"User Registered Successfully"
        });

    }
    catch(error){

        res.status(500).json({
            message:error.message
        });

    }

});
// Login API
app.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        console.log("EMAIL:", email);
        console.log("PASSWORD:", password);

        // Admin Login
        if (email === "admin@gmail.com" && password === "admin123") {
            return res.json({
                message: "Admin Login Successful",
                role: "admin"
            });
        }

        // Normal User Login
        const user = await User.findOne({ email });

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

        return res.json({
            message: "Login Successful",
            userId: user._id,
            role: "user"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});


app.get("/", (req,res)=>{
    res.send("Pushapa Jewellers Backend Running");
});


// ADD PRODUCT API

app.post("/add-product", async(req,res)=>{

    try{

        const product = new Product(req.body);

        await product.save();

        res.json({
            message:"Product Added Successfully"
        });

    }
    catch(error){

        res.status(500).json({
            message:error.message
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

// GET ALL PRODUCTS API

app.get("/products", async(req,res)=>{

    try{

        console.log("Database:", mongoose.connection.name);

        const products = await Product.find({});

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
app.listen(5000, ()=>{
    console.log("Server started on port 5000");
});
// UPDATE PRODUCT API

app.put("/products/:id", async(req,res)=>{

    try{

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new:true}
        );

        if(!updatedProduct){
            return res.status(404).json({
                message:"Product not found"
            });
        }

        res.json({
            message:"Product Updated Successfully",
            product:updatedProduct
        });

    }
    catch(error){

        res.status(500).json({
            message:error.message
        });

    }

});