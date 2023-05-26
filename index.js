const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());

console.log(process.env.DB_PASS)

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ixkqk3t.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },

});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)

    // await client.connect();

    const toyCollection = client.db("toyStore").collection("toys");


    // all toys by category
    app.get('/toys/tabs/:category', async (req, res) => {
      try {
          const category = req.params.category;
          const query = { subCategory: { $regex: category, $options: 'i' } };
          const result = await toyCollection.find(query).toArray();
          res.send(result);
      } catch (error) {
          console.error('Error fetching toys by sub-category:', error);
          res.status(500).json({ error: 'Failed to fetch toys by sub-category' });
   }
});

// all toys
    app.get('/toys', async (req, res) => {
      const cursor = toyCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })


// my toys by email
    app.get('/mytoys/:email', async (req, res) => {
      // console.log(req.params.email)
      const result = await toyCollection
        .find({ sellerEmail: req.params.email })
        .toArray();
      res.send(result);
    });

    app.get('/filteredToys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    });


// update toys
    app.put('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedToy = req.body;
      const toy = {
        $set: {
          pictureUrl: updatedToy.pictureUrl,
          name: updatedToy.name,
          price: updatedToy.price,
          rating: updatedToy.rating,
          availableQuantity: updatedToy.availableQuantity,
          description: updatedToy.description,
        }
      }
      const result = await toyCollection.updateOne(filter, toy, options);
      res.send(result);
    });



    app.delete('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    });



   //add data to database
      app.post('/addAToy', async (req, res) => {
        const newToy = req.body;
        console.log(newToy)
        const result = await toyCollection.insertOne(newToy);
        console.log('got new toy', result)
        res.send(result)
      })





      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
      // await client.close();
    }
  }
run().catch(console.dir);





  app.get('/', (req, res) => {
    res.send('toy store server is running')
  })

  app.listen(port, () => {
    console.log(`Toy Store Server is running on port ${port}`)
  })