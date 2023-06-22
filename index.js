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

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.raxgazv.mongodb.net/?retryWrites=true&w=majority`;
var uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@ac-lmdfmfj-shard-00-00.raxgazv.mongodb.net:27017,ac-lmdfmfj-shard-00-01.raxgazv.mongodb.net:27017,ac-lmdfmfj-shard-00-02.raxgazv.mongodb.net:27017/?ssl=true&replicaSet=atlas-p6lzib-shard-0&authSource=admin&retryWrites=true&w=majority";`




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
    // await client.connect();

    const db = client.db('toyportal')
    const toyCollection = db.collection('toys')

    // const indexKeys = { title: 1 }; 
    // const indexOptions = { name: "title" }; 
    // const result = await toyCollection.createIndex(indexKeys, indexOptions);
    // console.log(result);




    app.get('/alltoys', async (req, res) => {
      const cursor = toyCollection.find().limit(20);
      const result = await cursor.toArray();
      res.send(result);
  })

    app.get('/toys/:text',async(req,res)=>{
      console.log(req.params.text)
     if(req.params.text === "lego star wars" || req.params.text ==="lego city" ||req.params.text==="lego cars")
     {
      const result = await toyCollection
      .find({category:req.params.text})
        .limit(20)
      .toArray()
      return res.send(result)
     }
     const result = await toyCollection.find({}).limit(20).toArray()
     res.send(result)
    })



app.get("/mytoys/:email", async (req, res) => {
  console.log(req.params.email);
  const result = await toyCollection
    .aggregate([
      { $match: { postedBy: req.params.email } },
      {
        $addFields: {
          priceNumeric: {
            $convert: {
              input: { $substr: ["$price", 0, -1] },
              to: "int",
              onError: 0,
              onNull: 0
            }
          }
        }
      },
      { $sort: { priceNumeric: 1 } },
      { $project: { priceNumeric: 0 } }
    ])
    .toArray();

  res.send(result);
});


   

    app.get('/toy/:id', async(req, res)=>{
      const id= req.params.id
      const filter = {_id : new ObjectId(id)}
      const data = await toyCollection.findOne(filter)
      res.send(data)
  
  })

    app.post('/addtoys',async(req,res)=>{
        const body = req.body;
        const result = await toyCollection.insertOne(body)
        console.log(body)
        res.send(result)
    })

    app.get("/getToysByText/:text", async (req, res) => {
      const searchText = req.params.text;
      const result = await toyCollection
        .find({
          $or: [
            { title: { $regex: searchText, $options: "i" } },
            
          ],
        })
        .toArray();
      res.send(result);
    });


    app.put('/updatetoy/:id', async(req, res)=>{
      const id= req.params.id
      const body= req.body;
      const filter = {_id : new ObjectId(id)}
      const updatedDoc={
          $set:{
            title: body.title,
            quantity: body.quantity,
            description: body.description,
          }
      }
      const result= await toyCollection.updateOne(filter, updatedDoc)
      res.send(result)
  })

  app.delete('/toy/:id', async(req, res)=>{
    try{
        const id= req.params.id
    const filter = {_id : new ObjectId(id)}

    const result= await toyCollection.deleteOne(filter)
    res.send(result)
    }catch(err){
      res.send(err.message)
    }
})


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send('toy is running')
})
app.listen(port,()=>{
    console.log(`toy is running on port ${port}`)
})

