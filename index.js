const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app =express();

const port =process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

//hoteldb_user
//i2i9qHxX2RwdKVoW

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jkbvpzz.mongodb.net/?retryWrites=true&w=majority`;
//const uri = `mongodb+srv://hoteldb_user:i2i9qHxX2RwdKVoW@cluster0.jkbvpzz.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const roomsCollection =client.db('hoteldb').collection('roomsCollection');
    const bookingsCollection =client.db('hoteldb').collection('bookingsCollection');
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
/////////////////////
    // const quantity = await roomsCollection.findOneAndUpdate(
    //   { _id: new ObjectId(id) },
    //   { $inc: { quantity: -1 } }
    // );
    //////////////////
    await roomsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $inc: { quantity: -1 } }
    );
   
    res.send(result);

  })

  app.get('/bookings/:email', async (req, res) => {
    const email  = req.params.email;
    const query = { email }
    const result = await bookingsCollection.find(query).toArray();
    res.send(result);
    
  })
///booking data delete
  app.delete('/bookings/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await bookingsCollection.deleteOne(query);
    res.send(result);
})
///////////////////////////////////

   
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } 
  catch (error) {
    console.error('An error occurred:', error);
  }
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
  