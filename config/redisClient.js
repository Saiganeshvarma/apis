var {createClient} = require("redis")


var client = createClient({
    url : process.env.REDIS_URL
})

client.on("connect",()=>{
    console.log("connected to the redis");
})

client.on("error",(error)=>{
    console.log("error",error);
})


var connectRedis = async()=>{
    try{
        await client.connect()

    }catch(error){
        console.log("error");
    }
}




module.exports = {
    client,connectRedis
}