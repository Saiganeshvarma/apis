var Product = require("../Model/ProductModel");
const { uploadToCloudinary } = require("../helper/cloudinaryhelper");
var { client } = require("../config/redisClient");


// ✅ GET ALL PRODUCTS
var getAllProducts = async (req, res) => {
    try {
        var page = parseInt(req.query.page) || 1;
        var limit = parseInt(req.query.limit) || 10;
        var skip = (page - 1) * limit;

        var cacheKey = `allproducts:${page}:${limit}`;

        var cachedData = await client.get(cacheKey);

        if (cachedData) {
            console.log("data from redis");
            return res.status(200).json({
                products: JSON.parse(cachedData)
            });
        }

        var allProducts = await Product.find().skip(skip).limit(limit);

        await client.setEx(cacheKey, 3600, JSON.stringify(allProducts));

        console.log("data from mongo db");

        return res.status(200).json({
            products: allProducts
        });

    } catch (error) {
        console.log("error", error);
        return res.status(500).json({ message: "Server Error" });
    }
};


// ✅ GET SINGLE PRODUCT
var getSingleProduct = async (req, res) => {
    try {
        var id = req.params.id;
        var cacheKey = `product:${id}`;

        const cachedData = await client.get(cacheKey);

        if (cachedData) {
            return res.status(200).json({
                singleProduct: JSON.parse(cachedData)
            });
        }

        const singleProduct = await Product.findById(id);

        if (!singleProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        await client.setEx(cacheKey, 3600, JSON.stringify(singleProduct));

        return res.status(200).json({ singleProduct });

    } catch (error) {
        console.log("error", error);
        return res.status(500).json({ message: "Server Error" });
    }
};


// ✅ ADD PRODUCT
var addNewProduct = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ message: "Body is missing" });
        }

        var { title, description, price } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "Image file is required" });
        }

        const result = await uploadToCloudinary(req.file.path);

        var newProduct = await Product.create({
            title,
            description,
            price,
            image: {
                publicId: result.public_id,
                url: result.secure_url
            }
        });

        // ✅ clear all product list cache
        const keys = await client.keys("allproducts:*");
        if (keys.length > 0) {
            await client.del(keys);
        }

        return res.status(201).json({
            message: "Product added",
            product: newProduct
        });

    } catch (error) {
        console.log("error", error);
        return res.status(500).json({ message: "Server Error" });
    }
};


// ✅ UPDATE PRODUCT
var updateProduct = async (req, res) => {
    try {
        var id = req.params.id;
        var { title, description, price } = req.body;

        var updatedProduct = await Product.findByIdAndUpdate(
            id,
            { title, description, price },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        // ✅ clear caches properly
        const keys = await client.keys("allproducts:*");
        if (keys.length > 0) {
            await client.del(keys);
        }

        await client.del(`product:${id}`);

        return res.status(200).json({
            message: "Product updated",
            data: updatedProduct
        });

    } catch (error) {
        console.log("error", error);
        return res.status(500).json({ message: "Server Error" });
    }
};


// ✅ DELETE PRODUCT
var deleteProduct = async (req, res) => {
    try {
        var id = req.params.id;

        var deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        // ✅ clear caches
        const keys = await client.keys("allproducts:*");
        if (keys.length > 0) {
            await client.del(keys);
        }

        await client.del(`product:${id}`);

        return res.status(200).json({
            message: "Product deleted"
        });

    } catch (error) {
        console.log("error", error);
        return res.status(500).json({ message: "Server Error" });
    }
};


module.exports = {
    getAllProducts,
    getSingleProduct,
    addNewProduct,
    updateProduct,
    deleteProduct
};