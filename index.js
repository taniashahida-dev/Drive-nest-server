require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");
const uri = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

//  const JWKS = createRemoteJWKSet(
//       new URL('http://localhost:3000/api/auth/jwks')
//     )
// console.log(JWKS)

app.get("/", (req, res) => {
  res.send("server runinggg");
});

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
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

const run = async () => {
  try {
    await client.connect();

    const db = client.db("drive-nest");
    const carsCullection = db.collection("cars");
    const bookingCullection = db.collection("booking");
    const userCarCullection = db.collection("user-car");

    // get operation
    app.get("/car", async (req, res) => {
      const defaultCars = await carsCullection.find().toArray();

      const userCars = await userCarCullection.find().toArray();

      const allCars = [...defaultCars, ...userCars];

      res.send(allCars);
    });

    app.get("/available-cars", async (req, res) => {
      const cursor = carsCullection.find().limit(8);
      const result = await cursor.toArray();
      // console.log(result)
      res.send(result);
    });

    // get Operation by
    app.get("/explore/:id", async (req, res) => {

  const id = req.params.id

  const query = {
    _id: new ObjectId(id),
  }

  // first search in main cars
  let result = await carsCullection.findOne(query)

  // if not found search in user cars
  if (!result) {
    result = await userCarCullection.findOne(query)
  }

  res.send(result)
})

   
    // car bookings

    app.post("/bookings", async (req, res) => {
      const bookingData = req.body;
      const result = await bookingCullection.insertOne(bookingData);

      res.send(result);
    });
    app.get("/bookings/:email", async (req, res) => {
      const { email } = req.params;

      const result = await bookingCullection
        .find({
          userEmail: email,
        })
        .toArray();

      res.send(result);
    });

    //user added cars api
    app.post("/user-cars", async (req, res) => {
      const carData = req.body;
      const result = await userCarCullection.insertOne(carData);
      console.log(result);
      res.send(result);
    });
    app.get("/user-cars/:email", async (req, res) => {
      const { email } = req.params;
      const result = await userCarCullection
        .find({
          userEmail: email,
        })
        .toArray();
      console.log(result);
      res.send(result);
    });

    // patch operation
    app.patch("/user-cars/:id", async (req, res) => {
      const id = req.params.id;
      console.log("new car is come", id);
      const filter = {
        _id: new ObjectId(id),
      };
      const newCarData = req.body;
      const updateDocument = {
        $set: newCarData,
      };
      // console.log("After update", newCarData);
      const result = await userCarCullection.updateOne(filter, updateDocument);
      res.send(result);
    });

    // Delete operation
    app.delete("/user-cars/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await userCarCullection.deleteOne(query);
      res.send(result);
    });

    

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // await client.close()
  }
};
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Simple crud server is rinnung from  on port ${port}`);
});
