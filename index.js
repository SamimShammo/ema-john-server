const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');

var admin = require("firebase-admin");


const app = express();
const port = process.env.PORT || 4000;

// middleware
app.use(cors());
app.use(express.json());

// firebase admin initizalization 
var serviceAccount = require("./ema-john-12a7a-firebase-adminsdk-1yfje-79b28673fb.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  

async function verifyToken(req, res, next){
    if(req.headers?.authorization?.startsWith('Bearer ')){
        const idToken  = req.headers.authorization.split('Bearer ')[1]
        try{
            const decodeUser = await admin.auth().verifyIdToken(idToken);
            req.decodeUserEmail = decodeUser.email;
        }
        catch{

        }
        
    }
    next()
}

const uri = `mongodb+srv://${process.env.DB_PASS}:${process.env.DB_USER}@cluster0.qvlwz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
    try {
        await client.connect();
        const database = client.db('online_Shop');
        const productCollection = database.collection('products');
        const orderCollection = database.collection('myOrders');
      

       

        //GET Products API
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let products;
            const count = await cursor.count();

            if (page) {
                products = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                products = await cursor.toArray();
            }

            res.send({
                count,
                products
            });
        });
    // USE POST TO GET DATA BY KEYS
    app.post('/products/byKeys', async (req, res) => {
        const keys = req.body;
        const query = {key: {$in: keys}}
        const product = await productCollection.find(query).toArray()
        res.json(product)
    }) 

     // Get order api
       app.get('/myOrders', verifyToken, async(req, res) => {
          
             const email = req.query.email;
             if(req.decodeUserEmail === email){
                const query = {email: email};
            
                const cursor = orderCollection.find(query);
                const result = await cursor.toArray();
                res.json(result)
             }
             else{
                 res.status(401).json({message:'User not authorize'})
             }
            
            
    })

    app.post('/myOrders', async(req, res) => {
        const order = req.body;
        const result = await orderCollection.insertOne(order)
        res.json(result)
    })



    }
    finally {
        // await client.close();
    }
}



run().catch(console.dir);
app.get('/', (req, res) => {
    res.send('Ema John Server is running')
})



app.listen(port, () => {
    console.log('Server Running at PORT')
})