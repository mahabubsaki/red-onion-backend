const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000


app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wcxgg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect()
        const foodsCollection = client.db('redOnion').collection('foodCollection')
        app.get('/foods', async (req, res) => {
            const query = {}
            const cursor = foodsCollection.find(query)
            const foods = await cursor.toArray()
            res.send(foods)
        })
        app.get('/foods/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const food = await foodsCollection.findOne(query)
            res.send(food)
        })
        app.post('/foods', async (req, res) => {
            const newFood = req.body
            const result = await foodsCollection.insertOne(newFood)
            res.send(result)
        })
        app.post('/users', async (req, res) => {

        })
    }
    finally {

    }

}
run().catch(console.dir)
app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})