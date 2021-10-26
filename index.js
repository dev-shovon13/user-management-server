const express = require("express")
const { MongoClient } = require('mongodb');
const cors = require('cors')
const ObjectId = require('mongodb').ObjectId
require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.euv3j.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("Medizco-Center");
        const usersCollection = database.collection("users");

        // GET API '
        // all users 
        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find({})
            const users = await cursor.toArray()
            res.send(users)
        })
        //single user
        app.get('/users/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const user = await usersCollection.findOne(query)
            res.send(user)
        })

        // POST API
        app.post('/users', async (req, res) => {
            const newUser = req.body
            const result = await usersCollection.insertOne(newUser);
            res.json(result)
        })

        // UPDATE API 
        app.put('/users/:id', async (req, res) => {
            const id = req.params.id
            const updatedUser = req.body
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    name: updatedUser.name,
                    email: updatedUser.email,
                    phone: updatedUser.phone
                },
            };
            const result = await usersCollection.updateOne(filter, updateDoc, options)
            res.json(result)
        })

        // DELETE API 
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await usersCollection.deleteOne(query)
            res.json(result)
        })
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Node.js Server RUNNING')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})