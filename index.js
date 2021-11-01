const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 2000;

// middleware
app.use(cors());
app.use(express.json());

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

    // Add order api
    app.post('/products', async (req, res) => {
        const order = req.body;
        const result = await productCollection.insertOne(order);
        res.json('my', result);

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