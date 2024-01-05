const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app =express();

const port =process.env.PORT || 5000;

//middleware
app.use(cors({
  origin: [ 'http://localhost:5173',
  'http://localhost:5174',
  'https://ossified-mark.surge.sh',
    'https://hotel-service-5e6d3.firebaseapp.com',
    'https://hotel-service-5e6d3.web.app'],
  credentials: true

}));
app.use(express.json());
app.use(cookieParser());

//hoteldb_user
//i2i9qHxX2RwdKVoW
//newuser
//abcd1234

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jkbvpzz.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

//middlewares
const logger = async(req,res, next)=>{
  // console.log('called:',req.host, req.originalUrl)
    next();
}

const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
   console.log('token in the middleware', token);
  // no token available 
  if (!token) {
      return res.status(401).send({ message: 'unauthorized access' })
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
          return res.status(401).send({ message: 'unauthorized access' })
      }
      req.user = decoded;
      next();
  })
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //await client.connect();

    const roomsCollection =client.db('hoteldb').collection('roomsCollection');
    const bookingsCollection =client.db('hoteldb').collection('bookingsCollection');
    const userCollection =client.db('hoteldb').collection('users');
//////////auth related api

app.post('/jwt',async(req,res)=>{
  const user =req.body;
  console.log(user);
  const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn: '1h'})
 console.log(token);
  res.cookie('token',token,{
    httpOnly : true,  secure: process.env.NODE_ENV === 'production', 
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict' }).send({success:true})
})
////////server related Api
    //get all rooms

    app.get('/rooms',async(req,res)=>{
        const cursor =roomsCollection.find();
        const result =await cursor.toArray();
        res.send(result);
    })


    //room detail data get
    app.get('/rooms/:id', async (req, res) => {
        const id  = req.params.id;
        const query = { _id: new ObjectId(id) }

    //     const options = {
          
    //         projection: { description: 1, room_image:1, description:1, room_size: 1 },
    //     };
    //    const result = await roomsCollection.findOne(query,options);
      const result = await roomsCollection.findOne(query);
        res.send(result);
        
      })
////////////////////booking
 

  app.post('/bookings', async(req,res)=>{ 
    const newbooking =req.body;
    const id = newbooking._id;
    delete newbooking._id;
    console.log(newbooking);
    const result =await bookingsCollection.insertOne(newbooking);
   
    res.send(result);

  })

  app.get('/bookings/:email',  async (req, res) => {
    const email  = req.params.email;

  console.log('user in the valid token:', req.user)
    let query = { email }
    const result = await bookingsCollection.find(query).toArray();
    res.send(result);
    
  })


  app.get('/updateBooking',async(req,res)=>{
    const cursor =bookingsCollection.find();
    const result =await cursor.toArray();
    res.send(result);
})
//////////////////////update
  app.get('/updateBooking/:id', async (req, res) => {
    const id  = req.params.id;
    const query = { _id: new ObjectId(id) }
  const result = await bookingsCollection.findOne(query);
    res.send(result);
    
  })

  app.put('/updateBooking/:id', async(req, res) => {
    const id = req.params.id;
    const filter = {_id: new ObjectId(id)}
    const options = { upsert: true };
    const updatedbooking = req.body;

    const booking = {
        $set: {
          date: updatedbooking.date
        }
    }

    const result = await bookingsCollection.updateOne(filter, booking, options);
    res.send(result);
})
///booking data delete
  app.delete('/bookings/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await bookingsCollection.deleteOne(query);
    res.send(result);
})
// app.post('/users', async(req,res)=>{
//   const user =req.body;
//   const result =await userCollection.insertOne(user);
//   res.send(result);
// })
///////////////////////////////////

   
    // Send a ping to confirm a successful connection
   // await client.db("admin").command({ ping: 1 });
   // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } 
  // catch (error) {
  //   console.error('An error occurred:', error);
  // }
  finally {
    // Ensures that the client will close when you finish/error
   // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
    res.send("Crud is running...");
  });
  

  
app.listen(port, () => {
    console.log(`Simple Crud is Running on port ${port}`);
  });
  