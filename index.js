const express = require('express');
const app = express();
require('dotenv').config()
const { MongoClient } = require('mongodb');
const cors = require('cors')
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_PASS}:${process.env.DB_USER}@cluster0.qvlwz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('online_Shop');
        const productCollection = database.collection('products');
       

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