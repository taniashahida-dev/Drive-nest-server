require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs')
const uri = process.env.MONGODB_URI;


app.use(cors())
app.use(express.json())

//  const JWKS = createRemoteJWKSet(
//       new URL('http://localhost:3000/api/auth/jwks')
//     )
// console.log(JWKS)

app.get('/',(req,res)=>{
    res.send('server runinggg')
})

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// const loggin =async(req,res,next)=>{
//  const { authorization} = req.headers
//  const token = authorization?.split(' ')[1];

// if(!token){
//     res.status(401).json({message: 'Unautharized'})
// }

//  try {
//     const JWKS = createRemoteJWKSet(
//       new URL( `${process.env.CLIENT_URL}/api/auth/jwks`)
//     )
//     const { payload } = await jwtVerify(token, JWKS, )


//  req.user = payload
// //  console.log( req.user)
//     // return payload
//     next()
//   } catch (error) {
//     console.error('Token validation failed:', error)
//     res.status(401).json({message: 'Unautharized'})
//   }


//  console.log(token)
    // console.log(authoraize)
    // console.log(req)

// }

const run =async()=>{
try {
    await client.connect()
  
    const db = client.db('drive-nest')
    const carsCullection = db.collection('cars')



    // get operation
app.get('/car',async(req,res)=>{

// const {search}= req.query
let cursor

// if(search){
//     cursor =coursCullection.find({title: { $eq: search}})
// }else{
cursor = carsCullection.find()
// }


const result =await cursor.toArray()
// console.log(result)
res.send(result)
})


app.get('/available-cars',async(req,res)=>{
const cursor = carsCullection.find().limit(4)
const result =await cursor.toArray()
// console.log(result)
res.send(result)
})


 
// get Operation by 
app.get('/car/:id' ,async(req,res)=>{

   console.log(req?.user)
    const id = req.params.id
    const query= {
        _id: new ObjectId(id)
    }
    const result = await carsCullection.findOne(query)
    res.send(result)
})



// Post operation
// app.post('/users' ,async(req,res)=>{
//     const newUser= req.body
//    console.log('new user is come',newUser)
//     const result = await userCullection.insertOne(newUser)
//     res.send(result)
// })



// patch operation
// app.patch('/users/:id' ,async(req,res)=>{
//     const id= req.params.id
//    console.log('new user is come',id)
// const filter={
//   _id: new ObjectId(id)
// }
// const newUser = req.body
//     const updateDocument ={
//          $set: {
//     name: newUser.name,
//     role: newUser.role
//    }
//     }
//     console.log("After update",newUser)
//     const result = await userCullection.updateOne(filter,updateDocument)
//     res.send(result)
// })


// Delete operation
// app.delete('/users/:id' ,async(req,res)=>{
//     const id = req.params.id
//     const query= {
//         _id: new ObjectId(id)
//     }
//     const result = await userCullection.deleteOne(query)
//     res.send(result)
// })





    await client.db('admin').command({ping:1})
     console.log("Pinged your deployment. You successfully connected to MongoDB!");
}finally {
    // await client.close()
}
}
run().catch(console.dir)

app.listen(port,()=>{
    console.log(`Simple crud server is rinnung from  on port ${port}`)
})