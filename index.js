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
        const usersCollection = client.db('redOnion').collection('userCollection')
        app.get('/foods', async (req, res) => {
            const query = {}
            const cursor = foodsCollection.find(query)
            const foods = await cursor.toArray()
            res.send(foods)
        })
        app.get('/users', async (req, res) => {
            const query = {}
            const cursor = usersCollection.find(query)
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
            const reqUser = req.body
            const reqOrder = req.query
            const query = { email: reqUser.email }
            const newUser = await usersCollection.findOne(query)
            console.log(reqOrder)
            if (reqOrder.reason === 'order') {
                const orderQuery = { email: reqOrder.email }
                const orderedUser = await usersCollection.findOne(orderQuery)
                let allOrder;
                if (orderedUser?.allOrder) {
                    allOrder = [...orderedUser.allOrder]
                }
                else {
                    allOrder = []
                }
                const { order, formInfo } = req.body
                allOrder.push({ order, formInfo })
                const updatedOrder = { ...orderedUser, allOrder }
                const options = { upsert: true }
                const filter = { email: reqOrder.email }
                const updateDoc = {
                    $set: updatedOrder
                };
                const result = await usersCollection.updateOne(filter, updateDoc, options);
                res.send(result)
            }
            if (!newUser && !reqOrder) {
                const user = await usersCollection.insertOne(reqUser)
                res.send(user)
            }
            else {
                return
            }
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