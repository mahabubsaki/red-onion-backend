const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000
const jwt = require('jsonwebtoken')



app.use(cors())
app.use(express.json())

function verifyJwt(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized Access' })
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' })
        }
        req.decoded = decoded
        next()
    })
}
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wcxgg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect()
        const foodsCollection = client.db('redOnion').collection('foodCollection')
        const usersCollection = client.db('redOnion').collection('userCollection')
        app.post('/login', async (req, res) => {
            const user = req.body
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN, {
                expiresIn: '1d'
            })
            res.send({ accessToken })
        })
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
        app.get('/user/:email', verifyJwt, async (req, res) => {
            const decodedEmail = req.decoded.email
            const email = req.params.email
            if (decodedEmail === email) {
                const query = { email: email }
                const user = await usersCollection.findOne(query)
                res.send(user)
            }
            else {
                return res.status(403).send({ message: 'Forbidden Access' })
            }
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
            if (!newUser && !reqOrder?.reason) {
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