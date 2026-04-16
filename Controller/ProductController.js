
var Product = require("../Model/ProductModel");
const { uploadToCloudinary } = require("../helper/cloudinaryhelper");

var {client} = require("../config/redisClient")



var getAllProducts = async (req, res) => {
    try {
        var page = parseInt(req.query.page) || 1
        var limit = parseInt(req.query.limit) || 10
        var skip = (page-1)*limit

        var cacheKey = `allproducts:${page}:${limit}`;


        var cachedData = await client.get(cacheKey);

        if (cachedData) {
            console.log("data from redis");
            return res.status(200).json({
                products: JSON.parse(cachedData)
            });
        }

        var allProducts = await Product.find().skip(skip).limit(limit)

        await client.setEx(cacheKey, 3600, JSON.stringify(allProducts));

        console.log("data from mongo db");

        res.status(200).json({
            products: allProducts
        });

    } catch (error) {
        console.log("error", error);
    }
};


var getSingleProduct = async(req,res)=>{
    try{
        var id = req.params.id 
        var cacheKey =    `product:${id}`
        const cachedData = await client.get(cacheKey);
        if(cachedData){
            return res.status(200).json({
                singleProduct: JSON.parse(cachedData)
            });

        }
        const singleProduct = await Product.findById(id);
        await client.setEx(cacheKey, 60, JSON.stringify(singleProduct));
        res.status(200).json({ singleProduct });


    }catch(error){
        console.log("error",error);
    }
}


var addNewProduct = async (req, res) => {
    try {
        var { title, description, price } = req.body;

        var newProduct = await Product.create({
            title,
            description,
            price
        });

        // clear cache
        await client.del("allproducts"); // fix key name

        res.status(201).json({
            message: "product added",
            product: newProduct
        });

    } catch (error) {
        console.log("error", error);
    }
};
var updateProduct = async(req,res)=>{
    try{
        var id = req.params.id 
        var {title,description,price} = req.body
        var update = await Product.findByIdAndUpdate(id,{
            title,
            description,
            price

        },{
            new : true
        })
        await client.del("allProducts");
        await client.del(`product:${id}`);
        res.status(201).json({message : "product updated",data : update})

    }catch(error){
        console.log("error",error);
    }
}

var deleteProduct = async(req,res)=>{
    try{
        var id = req.params.id 
        var deletePro = await Product.findByIdAndDelete(id)
        res.status(200).json({message : "product deleted"})
        await client.del("allProducts");
        await client.del(`product:${id}`);

    }catch(error){
        console.log("error",error);
    }
}
module.exports = {
    getAllProducts,getSingleProduct,addNewProduct,updateProduct,deleteProduct
}

