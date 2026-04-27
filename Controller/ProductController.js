const Product = require("../Model/ProductModel");
const { uploadToCloudinary } = require("../helper/cloudinaryhelper");
const { client } = require("../config/redisClient");
const fs = require("fs");

// ✅ GET ALL PRODUCTS
const getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const cacheKey = `allproducts:${page}:${limit}`;

        const cachedData = await client.get(cacheKey);

        if (cachedData) {
            console.log("data from redis");
            return res.status(200).json({
                products: JSON.parse(cachedData)
            });
        }

        const products = await Product.find().skip(skip).limit(limit);

        await client.setEx(cacheKey, 3600, JSON.stringify(products));

        console.log("data from mongo db");

        return res.status(200).json({ products });

    } catch (error) {
        console.log("FULL ERROR:", error);
        return res.status(500).json({ message: "Server Error" });
    }
};


// ✅ GET SINGLE PRODUCT
const getSingleProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const cacheKey = `product:${id}`;

        const cachedData = await client.get(cacheKey);

        if (cachedData) {
            return res.status(200).json({
                singleProduct: JSON.parse(cachedData)
            });
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        await client.setEx(cacheKey, 3600, JSON.stringify(product));

        return res.status(200).json({ singleProduct: product });

    } catch (error) {
        console.log("FULL ERROR:", error);
        return res.status(500).json({ message: "Server Error" });
    }
};


// ✅ ADD PRODUCT
const addNewProduct = async (req, res) => {
    try {
        const { title, description, price } = req.body;

        if (!title || !description || !price) {
            return res.status(400).json({ message: "All fields required" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "Image file is required" });
        }

        const result = await uploadToCloudinary(req.file.path);

        // delete local file after upload
        fs.unlinkSync(req.file.path);

        const product = await Product.create({
            title,
            description,
            price,
            image: {
                publicId: result.publicId,
                url: result.url
            }
        });

        // clear cache safely
        const keys = await client.keys("allproducts:*");
        if (keys.length > 0) {
            await client.del(...keys);
        }

        return res.status(201).json({
            message: "Product added",
            product
        });

    } catch (error) {
        console.log("FULL ERROR:", error);
        return res.status(500).json({ message: "Server Error" });
    }
};


// ✅ UPDATE PRODUCT (with optional image update)
const updateProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const { title, description, price } = req.body;

        let updateData = { title, description, price };

        // if new image uploaded
        if (req.file) {
            const result = await uploadToCloudinary(req.file.path);
            fs.unlinkSync(req.file.path);

            updateData.image = {
                publicId: result.publicId,
                url: result.url
            };
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        const keys = await client.keys("allproducts:*");
        if (keys.length > 0) {
            await client.del(...keys);
        }

        await client.del(`product:${id}`);

        return res.status(200).json({
            message: "Product updated",
            data: updatedProduct
        });

    } catch (error) {
        console.log("FULL ERROR:", error);
        return res.status(500).json({ message: "Server Error" });
    }
};


// ✅ DELETE PRODUCT
const deleteProduct = async (req, res) => {
    try {
        const id = req.params.id;

        const deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        const keys = await client.keys("allproducts:*");
        if (keys.length > 0) {
            await client.del(...keys);
        }

        await client.del(`product:${id}`);

        return res.status(200).json({
            message: "Product deleted"
        });

    } catch (error) {
        console.log("FULL ERROR:", error);
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