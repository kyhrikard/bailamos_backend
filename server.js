const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const { Client } = require('pg')
const app = express()
const port = process.env.PORT || 5001
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
    SELECT du.id, du.firstname, du.lastname, du.age, du.username, role.name as role
    FROM danceuser du, role
    WHERE du.role = role.id
    AND username = $1`

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

app.get('/myclasses/:id', (request, response) => {
    const text = `
    SELECT res.id, res.username, res.name, res.datetime, danceuser.firstname as teacher
    FROM
	    (SELECT du.id, username, name, datetime, teacher
	    FROM dancecourseattendee dca, danceuser du, dancecourse dc, danceclass dcl
	    WHERE dc.id = dca.dancecourseid
	    AND dca.danceuserid = du.id
	    AND dcl.dancecourseid = dc.id) 
    AS res, danceuser
    WHERE danceuser.id = res.teacher
    AND res.id = $1
    ORDER BY datetime`

    const values = [request.params.id]

    client.query(text, values, (err, res) => {
        if (err) {
            response.status(400)
            response.json(err.detail)
        }
        else
            response.json(res.rows)
    })
})

app.get('/myteachercourses/:id', (request, response) => {
    const text = `
    select res.name as danceclass, du.username as teacher, du.id as userid, res.noofstudents
    from danceuser du,
	    (select name, teacher, count(*) as noOfStudents
	    from dancecourseattendee dca, dancecourse dc
	    where dca.dancecourseid = dc.id
	    group by name, teacher) as res
    where du.id = res.teacher
    and du.id = $1`

    const values = [request.params.id]

    client.query(text, values, (err, res) => {
        if (err) {
            response.status(400)
            response.json(err.detail)
        }
        else
            response.json(res.rows)
    })
})

