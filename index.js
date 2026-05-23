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

// const loggin = async (req, res, next) => {
//   const { authorization } = req.headers;
//   const token = authorization?.split(" ")[1];

//   if (!token) {
//     return   res.status(401).json({ message: "Unauthorized" });
//   }
//   try {
//     const JWKS = createRemoteJWKSet(
//       new URL(`${process.env.CLIENT_URL}/api/auth/jwks`),
//     );
//     const { payload } = await jwtVerify(token, JWKS);

//     req.user = payload;

//     return next();
//   } catch (error) {
//     console.error("Token validation failed:", error);
//     res.status(401).json({ message: "Unautharized" });
//   }

//   console.log(token);
// };



const loggin = async (req, res, next) => {

  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({
      message: "Unauthorized"
    });
  }

  const token = authorization.split(" ")[1];

  console.log("TOKEN:", token);

  // fake verify na
  // token ase kina sudhu check

  req.user = {
    email: req.params.email
  };

  next();
};



const run = async () => {
  try {
    await client.connect();

    const db = client.db("drive-nest");
    const carsCullection = db.collection("cars");
    const bookingCullection = db.collection("booking");
    const userCarCullection = db.collection("user-car");

    app.get("/car", async (req, res) => {
      const search = req.query.search || "";

      const type = req.query.type || "";

      // SEARCH QUERY
      let searchQuery = {};

      // regex search
      if (search) {
        searchQuery.name = {
          $regex: search,
          $options: "i",
        };
      }

      if (type) {
        searchQuery.carType = type;
      }

      const defaultCars = await carsCullection.find(searchQuery).toArray();

      const userCars = await userCarCullection.find(searchQuery).toArray();

      const allCars = [...defaultCars, ...userCars];

      res.send(allCars);
    });

    app.get("/available-cars", async (req, res) => {

  const query = {

    availability: {
      $regex: "^available$",
      $options: "i"
    }

  }

  const defaultCars = await carsCullection
    .find(query)
    .toArray()

  const userCars = await userCarCullection
    .find(query)
    .toArray()

  const allCars = [
    ...defaultCars,
    ...userCars
  ]

  const availableCars =
    allCars.slice(0, 8)

  res.send(availableCars)

})

    // get Operation by
    app.get("/explore/:id", loggin, async (req, res) => {
      const id = req.params.id;

      const query = {
        _id: new ObjectId(id),
      };

      // first search in main cars
      let result = await carsCullection.findOne(query);

      // if not found search in user cars
      if (!result) {
        result = await userCarCullection.findOne(query);
      }

      res.send(result);
    });

    // car bookings

    app.post("/bookings", async (req, res) => {
      const bookingData = req.body;
      const result = await bookingCullection.insertOne(bookingData);

      res.send(result);
    });
    app.get("/bookings/:email", loggin, async (req, res) => {
      const { email } = req.params;
      if (req.user.email !== email) {
        return res.status(403).json({
          message: "Forbidden",
        });
      }
      const result = await bookingCullection
        .find({
          userEmail: email,
        })
        .toArray();

      res.send(result);
    });

    app.delete("/bookings/:id", async (req, res) => {
      const { id } = req.params;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await bookingCullection.deleteOne(query);
      res.send(result);
    });

    app.patch("/booking-count/:id", async (req, res) => {
      const { id } = req.params;

      const filter = {
        _id: new ObjectId(id),
      };

      let result = await carsCullection.updateOne(filter, {
        $inc: {
          bookingCount: 1,
        },
      });

      if (result.matchedCount === 0) {
        result = await userCarCullection.updateOne(filter, {
          $inc: {
            bookingCount: 1,
          },
        });
      }

      res.send(result);
    });

    //user added cars api
    app.post("/user-cars", async (req, res) => {
      const carData = req.body;
      const result = await userCarCullection.insertOne(carData);
      console.log(result);
      res.send(result);
    });
    app.get("/user-cars/:email", loggin, async (req, res) => {
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
      // console.log("new car is come", id);
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
