const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const { Client } = require('pg')
const app = express()
const port = process.env.PORT || 5000
const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgres://abzasocflokido:6a7b5c88a860ba113df1f6a14402fcab61a952e7df03fb6f3d390cc24fe5533d@ec2-54-83-23-91.compute-1.amazonaws.com:5432/d2eqaog5l9ivkf',
    ssl: true
})

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors())

app.listen(port, () => {
    console.log(`Server is running at port ${port}`)
})

app.get('/', (request, response) => {
    response.write('<h1>Availiable endpoints at the Bailamos Backend</h1>')
    app._router.stack.forEach(function (r) {
        if (typeof r.route != 'undefined') {
            if (r.route.path !== '/') {
                response.write(`<h2>${r.route.path} -- ${r.route.stack[0].method}</h2>`)
            }
        }
    })
    response.end()
})

client.connect();

app.get('/danceusers', (request, response) => {
    const text = `
    SELECT *
    FROM danceuser`

    client.query(text, (err, res) => {
        if (err) {
            response.status(400)
            response.json(err.detail)
        }
        else
            response.json(res.rows)
    })
})

app.post('/login', function (request, response) {
    const text = `
    SELECT *
    FROM danceuser
    WHERE username = $1`

    const values = [request.body.username]

    client.query(text, values, (err, res) => {
        if (err) {
            response.status(400)
            response.json(err.detail)
        }
        else {
            response.json(res.rows);
        }
    })
})
